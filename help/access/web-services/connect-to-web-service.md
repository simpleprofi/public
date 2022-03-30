# Connect to a web service

[OpenAPI](https://swagger.io/docs/specification/about/), also known as swagger, is a popular format for describing the structure of REST APIs.
Datagrok can create a connection to a REST service based on its OpenAPI definitions in YAML or JSON format.
You can simply drag and drop an OpenAPI definitions file into Datagrok, and its content gets translated into data connections, queries, and functions. 

You can use the OpenAPI file provided by the service, or you can create an OpenAPI file by following the [OpenAPI specification](https://swagger.io/specification/).

All OpenAPI-based connections are available under the ![Web](/help/images/web.png) **Web** item in the list of connections.
The name of the connection is extracted from the `info - title` field of the definition file.
Datagrok creates demo connectors for a number of popular REST API services. 
The OpenAPI definition files for all demo connectors are available in our public repository: https://github.com/datagrok-ai/public/tree/master/packages/Swaggers/swaggers.


## Import an OpenAPI definition file

You can import an OpenAPI definition file in multiple ways:

* Drag and drop a file into the Datagrok UI
* From the menu, select **File** > **Connect to data**, then right-click on ![Web](/help/images/web.png) **Web**
* In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Webservices** > **Import OpenAPI file...**


Datagrok parses the file and creates the following entities based on its content:

* A Web connection with the name and description from the `title` and `description` fields.
* A data query within the created connection for each operation defined in the OpenAPI file. The name of the query is taken from the `summary` field. 

See the [Example](#example) section below for specific examples of queries created from API paths. 


## Edit connection parameters




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

This image shows what the input fields for credentials look like for the API key-based authentication defined as follows: 

```yaml
securityDefinitions:
  api_key:
    type: apiKey
    name: API_KEY
    in: query
```

## **Requires Server** option

The connection properties dialog for OpenAPI-based connections contains an option called **Requires server**. 
If this option is selected, Datagrok makes requests to the web service endpoint via the backend server (server-side). 
That is, the backed server makes the request, and then the results are transferred to the Datagrok UI .
If the option is not selected, Datagrok makes requests to the web service endpoint via JavaScript directly from your browser (client-side).

A client-side may be faster and easier to debug via browser's JavaScript console. 
However, if client-side requests do not work (e.g. if the web service does not allow CORS requests), select this option to send request via the Datagrok backend. 
Note that if the connection is protected by credentials, Datagrok will need to fetch the credentials to the UI to perform client-side requests, which may be a security concern. 



## See also 

* [Create an OpenAPI-based connection via a package](/help/develop/develop.md#packages)
