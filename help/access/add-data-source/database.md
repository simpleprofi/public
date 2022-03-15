# Connect to a database

Datagrok can connect to many popular databases through JDBC.
Typically, you will need to provide a server name and login credentials.

## Set up a connection

1. Open the list of available connectors:
    * In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Databases**, or
    * From the top menu bar, select **File** > **Connect to data...**

2. Right-click on a database icon you want to use and select **Add connection...**.

    ![Add connection](/help/images/access/data-connection-tree.png)

3. Fill out the connection parameters in the dialog that appears.

NOTE: The **Conn String** field is for specifying a JDBC connection string.
If entered, the connection string overwrites connection parameters except for the credentials.
See [Use a JDBC connection string](#use-a-jdbc-connection-string) below.

    ![Connection parameters](/help/images/access/connection-properties.png)

4. Test your connection by clicking **TEST** and then click **OK**.
    
    
### Use a JDBC connection string

In some cases, your connection may require that you specify a JDBC connection string.
The connectors that support a custom JDBC connection string, the connection parameters dialog has the *Conn String* field.
If specified, the given string is used to establish a connection, and all other parameters are ignored except for **Login** and **Password**.

## What's next

* [Explore the database]()
* [Run queries]()
* [Combine data from multiple data sources]()
