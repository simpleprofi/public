# Webservices


## OpenAPI

<!--
Provides access to data sources via REST API based on link:https://swagger.io/[OpenAPI 2.0 (Swagger API)].
-->


[OpenAPI](https://swagger.io/docs/specification/about/), also known as swagger, is a popular format for describing the structure of REST APIs.
Datagrok can create a connection to a REST service based on its OpenAPI definitions in YAML or JSON format.
You can simply drag and drop an OpenAPI definitions file into Datagrok, and its content gets translated into data connections, queries, and functions. 

All OpenAPI-based connections are available under the ![Web](/help/images/web.png) **Web** item in the list of connections.
The name of the connection is extracted from the `info - title` field of the definition file.

<!--
You can find this connection in [Connections Tree](https://public.datagrok.ai/connect)
under the source "Web". There is a special view
[Web Services](https://public.datagrok.ai/webservices) in the Datagrok's UI, which displays only OpenAPI connections.
These connections may also be found in the "Data" section on the left sidebar next to "Databases".
-->

## Import an OpenAPI definition file

You can import an OpenAPI definition file in multiple ways:

* Drag and drop a file into the Datagrok UI
* From the menu, select **File** > **Connect to data**, then right-click on ![Web](/help/images/web.png) **Web**
* In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Webservices** > **Import OpenAPI file...**

<!--
## How OpenAPI definition is interpreted
-->

Datagrok creates the following entities based on the OpenAPI definition file:

* A Web connection with the name and description from the `title` and `description` fields.
* A data query within the created connection for each `path` defined in the OpenAPI file. The name of the query is taken from the `summary` field. 

See the [Example](#example) section below for specific examples. 


## Provide credentials for the REST API service

Datagrok supports all types of OpenAPI security schemes: 

- `basic` for Basic authentication
- `apiKey` for an API key
- `oauth2` for OAuth 2



## Pass query parameters




## Parse `date-time` format


<!--

| In Swagger File | In Datagrok                                          |
|-----------------|------------------------------------------------------|
| title           | Connection name                                      |
| description     | Connection description                               |
| paths           | Each path becomes a data query within the connection |
| summary         | Data query  name                                     |

-->


## Example

```yaml
swagger: '2.0'
info:
  description: 'AirNow'
  title: AirNow
host: airnowapi.org
basePath: /aq
schemes:
  - http
paths:
  /observation/latLong/historical/:
    get:
      summary: Historical Observation By Latitude and Longitude
      operationId: historicalObservationByLatitudeAndLongitude
      produces:
        - text/csv
        - application/xml
        - application/json
      parameters:
        - name: date
          in: query
          required: false
          description: Date of forecast. If date is omitted, the current forecast is returned.
          type: string
          format: date-time
          grok-datetime-format: yyyy-MM-ddT00-0000
        - $ref: '#/parameters/latitude'
        - $ref: '#/parameters/longitude'
        - $ref: '#/parameters/distance'
      responses:
        '200':
          description: successful operation
          schema:
            type: array
            items:
              $ref: '#/definitions/Observation'
        '400':
          description: Invalid status value
grok-datetime-format: yyyy-MM-dd
parameters:
  distance:
    name: distance
    in: query
    required: false
    description: |
      If no reporting area is associated with the specified Zip Code, 
      return a forecast from a nearby reporting area within this distance (in miles).
    type: integer
    format: int32
  latitude:
    name: latitude
    in: query
    description: Latitude in decimal degrees.
    required: true
    type: number
    format: float
  longitude:
    name: longitude
    in: query
    required: true
    description: Longitude in decimal degrees.
    type: number
    format: float
securityDefinitions:
  api_key:
    type: apiKey
    name: API_KEY
    in: query
```
<!--
## OData

Provides access to https://www.odata.org/[OData]-based services.
-->

