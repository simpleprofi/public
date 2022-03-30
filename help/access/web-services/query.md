# Query web-services



Each operation defined in the OpenAPI file becomes a [Datagrok query](/help/access/queries.md).
Like other queries in Datagrok, OpenAPI queries are available under the parent connection item in the [connection list](#) and in the **Queries** view.  

To execute an operation, right-click on the corresponding query and select **Run**. 
Operations that do not require parameters are executed right away.
If an operation requires parameters, Datagrok shows the query parameters dialog. 

![Run OpenAPI query](/help/images/access/run-openapi-query.gif)


## Specify format for `date-time` fields 

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