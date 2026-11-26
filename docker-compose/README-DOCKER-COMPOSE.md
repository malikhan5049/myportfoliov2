# JHipster generated Docker-Compose configuration

## Usage

Launch all your infrastructure by running: `docker compose up -d`.

## Windows Dev Drive (ReFS) required fix

If this repository is checked out on a **Windows Dev Drive** (an ReFS volume, e.g. `V:`), Docker
Desktop's file sharing cannot see files on it: bind mounts appear **empty** (a file mount shows up as
a phantom empty directory instead). This breaks the Keycloak realm import in `docker-compose.yml`
— Keycloak logs `Import finished successfully` but imports nothing, and the apps then fail to start
with `Unable to resolve Configuration with the provided Issuer of ".../realms/jhipster"` (`Realm does
not exist`). Keycloak also reports `unhealthy` because its healthcheck script is not visible either.

Fix: allow the two filesystem filter drivers Docker needs on the Dev Drive (they are detached by
default on Dev Drives). Run in an **elevated** PowerShell:

```powershell
fsutil devdrv setfiltersallowed /f /volume <DRIVE> "bindFlt, wcifs"
```

Then restart the file-sharing stack (no reboot required):

```powershell
wsl --shutdown
```

and restart Docker Desktop. Finally **recreate** the containers so they pick up working mounts
(placeholders created while the filters were disabled persist in the container):

```powershell
docker compose -f docker-compose/docker-compose.yml down
docker compose -f docker-compose/docker-compose.yml up -d
```

Verify before starting the apps:

```powershell
docker run --rm -v "<REPO>/gateway/src/main/docker/realm-config:/test" alpine ls -la /test
```

`jhipster-realm.json` must appear in the listing.

References: [docker/for-win#13719](https://github.com/docker/for-win/issues/13719) and
[Microsoft Dev Drive docs — filters for common scenarios](https://learn.microsoft.com/en-us/windows/dev-drive/#filters-for-common-scenarios).
A drive-letter mapping (e.g. `V:`) is required — Dev Drives mounted at a directory path are not
supported by this workaround.

## Configured Docker services

### Service registry and configuration server:

- [Consul](http://localhost:8500)

### Applications and dependencies:

- gateway (gateway application)
- gateway's postgresql database
- blog (microservice application)
- blog's neo4j database
- store (microservice application)
- store's mongodb database

### Additional Services:

- [Keycloak server](http://localhost:9080)
