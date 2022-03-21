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
    See [Use a custom JDBC connection string](#use-a-custom-jdbc-connection-string) below.

    ![Connection parameters](/help/images/access/connection-properties.png)

4. Test your connection by clicking **TEST** and then click **OK**.
    
    
### Use a custom JDBC connection string

In some cases, you may want to specify a JDBC connection string manually.
If a connector supports a custom JDBC connection string, the connection parameters dialog has the *Conn String* field.
If specified, the given string is used to establish a connection, and all other parameters except for **Login** and **Password** are ignored.

## What's next

* [Explore database contents and schemas]()
* [Run queries](queries.md)