# Connect to a SPARQL endpoint


Datagrok offers a SPARQL connector that can be used to access RDF data (Resource Description Framework).  

## Add a SPARQL endpoint

To add a connection to a SPARQL endpoint, take the following steps:

1. In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Databases** > ![Sparql](/help/images/sparql.png) **Sparql**. 
2. Fill in the connection parameter. 

   |Option             | Description                           |
   |-------------------|---------------------------------------|
   | Name              | The name of the connection.           |
   | Endpoint          | The URL of the SPARQL query endpoint. |
   | Requires Server   | Whether to send query requests via the Datagrok backend or via JavaScript directly from the browser. See [Requires Server options](#requires-server-option) for details.  |
   | Prefixes          | A list of prefixes that can be used in queries. These prefixes are available in all queries within this connection. You can also specify prefixes for individual queries. |

3. Verify your connection by clicking **TEST** and then click **OK**.