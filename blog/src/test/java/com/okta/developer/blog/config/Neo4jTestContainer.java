package com.okta.developer.blog.config;

import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
public class Neo4jTestContainer {

    private static final Neo4jContainer NEO4J_CONTAINER = (Neo4jContainer) new Neo4jContainer(DockerImageName.parse("neo4j:5.26.30"))
        .withoutAuthentication()
        .withLogConsumer(new Slf4jLogConsumer(LoggerFactory.getLogger(Neo4jTestContainer.class)));

    @Bean
    @ServiceConnection
    Neo4jContainer<?> neo4jContainer() {
        return NEO4J_CONTAINER;
    }
}
