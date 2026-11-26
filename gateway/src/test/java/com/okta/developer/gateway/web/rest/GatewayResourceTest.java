package com.okta.developer.gateway.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.okta.developer.gateway.web.rest.vm.RouteVM;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.reactivestreams.Publisher;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.handler.AsyncPredicate;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class GatewayResourceTest {

    private static final String APP_NAME = "gateway";

    @Mock
    private RouteLocator routeLocator;

    @Mock
    private DiscoveryClient discoveryClient;

    private GatewayResource gatewayResource;

    @BeforeEach
    void setUp() {
        gatewayResource = new GatewayResource(routeLocator, discoveryClient);
        ReflectionTestUtils.setField(gatewayResource, "appName", APP_NAME);
    }

    @Test
    void shouldKeepOtherRoutesWhenDiscoveryFailsForOneService() {
        when(routeLocator.getRoutes()).thenReturn(
            Flux.just(
                route("ReactiveCompositeDiscoveryClient_blog", "[/services/blog/**]"),
                route("ReactiveCompositeDiscoveryClient_store", "[/services/store/**]")
            )
        );
        when(discoveryClient.getInstances("blog")).thenThrow(new RuntimeException("Discovery is unavailable"));
        List<ServiceInstance> storeInstances = List.of(new DefaultServiceInstance("store-1", "store", "localhost", 8082, false));
        when(discoveryClient.getInstances("store")).thenReturn(storeInstances);

        ResponseEntity<List<RouteVM>> response = gatewayResource.activeRoutes().block();

        assertThat(response).isNotNull();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<RouteVM> routes = response.getBody();
        assertThat(routes).isNotNull().hasSize(2);

        RouteVM blogRoute = routeByServiceId(routes, "blog");
        assertThat(blogRoute.getPath()).isEqualTo("/services/blog/**");
        assertThat(blogRoute.getServiceInstances()).isNotNull().isEmpty();

        RouteVM storeRoute = routeByServiceId(routes, "store");
        assertThat(storeRoute.getPath()).isEqualTo("/services/store/**");
        assertThat(storeRoute.getServiceInstances()).containsExactlyElementsOf(storeInstances);
    }

    @Test
    void shouldExcludeGatewayOwnRoute() {
        when(routeLocator.getRoutes()).thenReturn(
            Flux.just(
                route("gateway_gateway", "[/services/gateway/**]"),
                route("ReactiveCompositeDiscoveryClient_blog", "[/services/blog/**]")
            )
        );
        when(discoveryClient.getInstances("blog")).thenReturn(Collections.emptyList());

        ResponseEntity<List<RouteVM>> response = gatewayResource.activeRoutes().block();

        assertThat(response).isNotNull();
        List<RouteVM> routes = response.getBody();
        assertThat(routes).isNotNull().hasSize(1);
        assertThat(routes.get(0).getServiceId()).isEqualTo("blog");
        verify(discoveryClient, never()).getInstances("gateway");
    }

    @Test
    void shouldReturnParsedRoutesForHappyPath() {
        when(routeLocator.getRoutes()).thenReturn(
            Flux.just(
                route("ReactiveCompositeDiscoveryClient_blog", "[/services/blog/**]"),
                route("ReactiveCompositeDiscoveryClient_store", "[/services/store/**]")
            )
        );
        when(discoveryClient.getInstances("blog")).thenReturn(
            List.of(new DefaultServiceInstance("blog-1", "blog", "localhost", 8081, false))
        );
        when(discoveryClient.getInstances("store")).thenReturn(
            List.of(new DefaultServiceInstance("store-1", "store", "localhost", 8082, false))
        );

        ResponseEntity<List<RouteVM>> response = gatewayResource.activeRoutes().block();

        assertThat(response).isNotNull();
        List<RouteVM> routes = response.getBody();
        assertThat(routes).isNotNull().hasSize(2);
        assertThat(routes).extracting(RouteVM::getPath).containsExactly("/services/blog/**", "/services/store/**");
        assertThat(routes).extracting(RouteVM::getServiceId).containsExactly("blog", "store");
        assertThat(routes).allSatisfy(route -> assertThat(route.getServiceInstances()).hasSize(1));
    }

    @Test
    void shouldSkipRouteWithUnparseablePredicateWithoutFailingOthers() {
        when(routeLocator.getRoutes()).thenReturn(
            Flux.just(
                route("ReactiveCompositeDiscoveryClient_broken", "no path here"),
                route("ReactiveCompositeDiscoveryClient_blog", "[/services/blog/**]")
            )
        );
        when(discoveryClient.getInstances("blog")).thenReturn(Collections.emptyList());

        ResponseEntity<List<RouteVM>> response = gatewayResource.activeRoutes().block();

        assertThat(response).isNotNull();
        List<RouteVM> routes = response.getBody();
        assertThat(routes).isNotNull().hasSize(1);
        assertThat(routes.get(0).getServiceId()).isEqualTo("blog");
        assertThat(routes.get(0).getPath()).isEqualTo("/services/blog/**");
    }

    private static RouteVM routeByServiceId(List<RouteVM> routes, String serviceId) {
        return routes
            .stream()
            .filter(route -> serviceId.equals(route.getServiceId()))
            .findFirst()
            .orElseThrow();
    }

    private static Route route(String id, String predicateString) {
        AsyncPredicate<ServerWebExchange> predicate = new AsyncPredicate<>() {
            @Override
            public Publisher<Boolean> apply(ServerWebExchange exchange) {
                return Mono.just(true);
            }

            @Override
            public String toString() {
                return predicateString;
            }
        };
        return Route.async()
            .id(id)
            .uri(URI.create("lb://" + id.substring(id.indexOf("_") + 1)))
            .asyncPredicate(predicate)
            .build();
    }
}
