package com.okta.developer.gateway.web.rest;

import com.okta.developer.gateway.security.AuthoritiesConstants;
import com.okta.developer.gateway.web.rest.vm.RouteVM;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api/gateway")
public class GatewayResource {

    private static final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    private final RouteLocator routeLocator;

    private final DiscoveryClient discoveryClient;

    @Value("${spring.application.name}")
    private String appName;

    public GatewayResource(RouteLocator routeLocator, DiscoveryClient discoveryClient) {
        this.routeLocator = routeLocator;
        this.discoveryClient = discoveryClient;
    }

    /**
     * {@code GET  /routes} : get the active routes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the list of routes.
     */
    @GetMapping("/routes")
    @Secured(AuthoritiesConstants.ADMIN)
    public Mono<ResponseEntity<List<RouteVM>>> activeRoutes() {
        return routeLocator.getRoutes().concatMap(this::toRouteVM).collectList().map(ResponseEntity::ok);
    }

    private Mono<RouteVM> toRouteVM(Route route) {
        String path;
        String serviceId;
        try {
            // Manipulate strings to make Gateway routes look like Zuul's
            String predicate = route.getPredicate().toString();
            int pathStart = predicate.indexOf("[");
            int pathEnd = predicate.indexOf("]");
            if (pathStart < 0 || pathEnd <= pathStart) {
                log.warn("Unable to parse the path from predicate '{}' of route '{}', skipping it", predicate, route.getId());
                return Mono.empty();
            }
            path = predicate.substring(pathStart + 1, pathEnd);
            serviceId = route
                .getId()
                .substring(route.getId().indexOf("_") + 1)
                .toLowerCase();
        } catch (RuntimeException e) {
            log.warn("Unable to parse route '{}', skipping it", route.getId(), e);
            return Mono.empty();
        }

        // Exclude gateway app from routes
        if (serviceId.equalsIgnoreCase(appName)) {
            return Mono.empty();
        }

        RouteVM routeVM = new RouteVM();
        routeVM.setPath(path);
        routeVM.setServiceId(serviceId);
        return Mono.fromCallable(() -> discoveryClient.getInstances(serviceId))
            .subscribeOn(Schedulers.boundedElastic())
            .onErrorResume(throwable -> {
                log.warn("Unable to retrieve the instances of service '{}'", serviceId, throwable);
                return Mono.just(Collections.<ServiceInstance>emptyList());
            })
            .defaultIfEmpty(Collections.emptyList())
            .map(serviceInstances -> {
                routeVM.setServiceInstances(serviceInstances);
                return routeVM;
            });
    }
}
