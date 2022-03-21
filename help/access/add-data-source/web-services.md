# Webservices


Datagrok has out-of-the-box connectors to the following types of services:

* OpenAPI-based APIs (Swagger)
* OData-based REST APIs
* RDF-based data (SPARQL)
* Twitter




## OpenAPI-based APIs

[OpenAPI](https://swagger.io/docs/specification/about/), also known as swagger, is a popular format for describing the structure of REST APIs.
Datagrok can create a connection to a REST service based on its OpenAPI definitions in YAML or JSON format.
You can simply drag and drop an OpenAPI definitions file into Datagrok, and its content gets translated into data connections, queries, and functions. 

You can use the OpenAPI file provided by the service, or you can create an OpenAPI file by following the [OpenAPI specification](https://swagger.io/specification/).

All OpenAPI-based connections are available under the ![Web](/help/images/web.png) **Web** item in the list of connections.
The name of the connection is extracted from the `info - title` field of the definition file.
Datagrok creates demo connectors for a number of popular REST API services. 
The OpenAPI definition files for all demo connectors are available in our public repository: https://github.com/datagrok-ai/public/tree/master/packages/Swaggers/swaggers.


### Import an OpenAPI definition file

You can import an OpenAPI definition file in multiple ways:

* Drag and drop a file into the Datagrok UI
* From the menu, select **File** > **Connect to data**, then right-click on ![Web](/help/images/web.png) **Web**
* In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Webservices** > **Import OpenAPI file...**


Datagrok parses the file and creates the following entities based on its content:

* A Web connection with the name and description from the `title` and `description` fields.
* A data query within the created connection for each operation defined in the OpenAPI file. The name of the query is taken from the `summary` field. 

See the [Example](#example) section below for specific examples of queries created from API paths. 


TODO: query parameters 

<!-- TODO: what's the Requires Server option? -->

### Provide security credentials for the REST API service

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

This image shows what the input fields for credentials look like for the API key-based authentication defined as follows: 

```yaml
securityDefinitions:
  api_key:
    type: apiKey
    name: API_KEY
    in: query
```


### Execute API operations

Each operation defined in the OpenAPI file becomes a [Datagrok query](/help/access/queries.md).
Like other queries in Datagrok, OpenAPI queries are available under the parent connection item in the [connection list](#) and in the **Queries** view.  

To execute an operation, right-click on the corresponding query and select **Run**. 
Operations that do not require parameters are executed right away.
If an operation requires parameters, Datagrok shows the query parameters dialog. 

![Run OpenAPI query](/help/images/access/run-openapi-query.gif)


<!--
Consider the following `get` operation.
```yaml
paths:
  /forecast/zipCode/:
    get:
      summary: Forecast By Zip Code
      operationId: forecastByZipCode
      produces:
        - text/csv
        - application/xml
        - application/json
      parameters:
        - $ref: '#/parameters/zipCode'
        - $ref: '#/parameters/date'
        - $ref: '#/parameters/format'
        - $ref: '#/parameters/distance'
      responses:
        '200':
          description: successful operation
          schema:
            type: array
            items:
              $ref: '#/definitions/Forecast'
        '400':
          description: Invalid status value
```

## Pass query parameters

The OpenAPI definition may contain the definition of parameters that are used across the operations allowed by the service.

-->

### Specify format for `date-time` fields 

If an API operation has `date-time` parameters, the service usually requires that these parameters be specified in a specific format, for example `yyyy-MM-dd`. 
Otherwise, the service won't be able to parse the provided value.
It is the responsibility of the user to know what is expected and to provide the value in the correct format.
For cases like this, you can add an extra attribute `grok-datetime-format` to the OpenAPI file to describe the specific `date-time` format the service is expecting.

This attribute is not part of the OpenAPI specification.
It was conceived by the Datagrok team as a means to convert `date-time` values provided by the user into the expected format.
In the Datagrok UI, you simply use a date & time picker to select a date, and the value is converted to the correct format when the query is executed.

![Date-time field](/help/images/access/date-time-field.png)

You can specify the parameter on the root level (globally) or within the definition of individual parameters.

Example of global definition: 
```yaml
swagger: '2.0'
info:
  description: 'AirNow'
  title: AirNow
host: airnowapi.org

grok-datetime-format: yyyy-MM-dd
```

Example for a single parameter:
```yaml
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
```

### Example

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

## OData-based REST APIs

Provides access to [OData](https://www.odata.org/)-based services.

## RDF-based data (SPARQL)

To add a connection to a SPARQL endpoint:

1. In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Databases** > ![Sparql](/help/images/sparql.png) **Sparql**. 


## Twitter


## **Requires server** option


If this option is selected, Datagrok makes requests to the web service endpoint via the backend server. 
That is, the backed server makes the request, and then the results are transferred to the Datagrok UI.
If the option is not selected, Datagrok makes requests to the web service endpoint via JavaScript directly from your browser.

A direct request from the browser may be faster and easier to debug via browser's JavaScript console. 
However, if direct requests from the browser do not work (e.g. if the web service does not allow CORS requests), select this option to send request via the Datagrok backend. 


## What's next

* [Create an OpenAPI-based connection via a package](/help/develop/develop.md#packages)