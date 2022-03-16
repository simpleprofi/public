# Webservices


## OpenAPI

[OpenAPI](https://swagger.io/docs/specification/about/), also known as swagger, is a popular format for describing the structure of REST APIs.
Datagrok can create a connection to a REST service based on its OpenAPI definitions in YAML or JSON format.
You can simply drag and drop an OpenAPI definitions file into Datagrok, and its content gets translated into data connections, queries, and functions. 

All OpenAPI-based connections are available under the ![Web](/help/images/web.png) **Web** item in the list of connections.
The name of the connection is extracted from the `info - title` field of the definition file.
Datagrok creates demo connectors for a number of popular REST API services. 
The OpenAPI definition files for all demo connectors are available in our public repository: https://github.com/datagrok-ai/public/tree/master/packages/Swaggers/swaggers.


## Import an OpenAPI definition file

You can import an OpenAPI definition file in multiple ways:

* Drag and drop a file into the Datagrok UI
* From the menu, select **File** > **Connect to data**, then right-click on ![Web](/help/images/web.png) **Web**
* In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Webservices** > **Import OpenAPI file...**

<!--
## How OpenAPI definition is interpreted
-->

Datagrok parses the file and creates the following entities based on its content:

* A Web connection with the name and description from the `title` and `description` fields.
* A data query within the created connection for each `path` defined in the OpenAPI file. The name of the query is taken from the `summary` field. 

See the [Example](#example) section below for specific examples of queries created from API paths. 


<!-- TODO: what's the Requires Server option? -->

## Provide security credentials for the REST API service

Datagrok supports all types of OpenAPI security schemes (authentication types): 

- `basic` for Basic authentication
- `apiKey` for an API key
- `oauth2` for OAuth 2

The security scheme is defined in the OpenAPI file, in the `securityDefinitions` section.
Datagrok recognizes the authentication type and lets you provide the security credentials in the connection properties dialog.
Note that for different security schemes the dialog contains different input fields: **Login** and **Password** for basic authentication, **ApiKey** for API key-based authentication, and so on. 
If the OpenAPI file does not define any security schemes, the properties dialog does not contain any input fields for credentials. 

To open the connection properties dialog, right-click on the connection created from the OpenAPI file and select **Edit...**. 

![OpenAPI connection properties dialog](/help/images/access/openapi-connection-properties.png) 




## Pass query parameters





## Specify format for `date-time` fields 


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

