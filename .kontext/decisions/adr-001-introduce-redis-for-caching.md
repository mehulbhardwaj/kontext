---
id: ADR-001
status: accepted
date: 2023-10-27
tags: []
---
# ADR-001: Introduce Redis for Caching

## Context
We need a cache. To mitigate 'Context Entropy' and improve application performance, we need a mechanism to store and retrieve stateful information rapidly. Local in-memory storage is insufficient for distributed environments or persistent state across restarts.

## Decision
We are introducing Redis as the primary caching and state management layer. It is selected for being fast and reliable. The `RedisCache` service will serve as the abstraction layer for interacting with the Redis store.

## Consequences
- **Infrastructure**: Adds a requirement for a Redis server in both development and production environments.
- **Performance**: Provides sub-millisecond latency for state retrieval.
- **Complexity**: Introduces the need for connection management, error handling for external services, and cache invalidation strategies.