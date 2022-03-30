# Connect to a file hosting

Datagrok provides out-of-the-box connectors for the following file hosting services:

* Dropbox
* Google Cloud 
* Git
* GitHub
* Amazon S3

All file hosting services connected to Datagrok appear as folders in the [Datagrok file browser](/help/access/files/browse-files.html#file-browser).


## Connect to a file hosting 

To connect to a file hosting service, use the connector for the service: 

1. In the left sidebar, click ![Open](/help/images/open-icon.png) > **Files** and then click **New file share** under the **Actions** label. 
This opens the **New file share** dialog. 

   ![Connect a file hosting](/help/images/access/connect-file-hosting.gif)

    Alternatively, from the menu, select **File** > **Connect to Data...**.
    In the list of connectors, right-click on the icon for the file hosting you want to connect and select **Add connection...**.
<!---
    ![File share properties](/images/access/file-share-properties.png)
    --->

2. In the **Data Source** field, select a type of file hosting you want to access.
3. In the **Name** field, enter a name for the connection.  
4. Enter connection parameters for the file hosting.
The parameters vary depending on the type of file hosting.
Typically, you would need to provide access credentials and additional parameters such as region and bucket name for cloud hosting service.

5. In the **Dir** field, enter a directory path within the file hosting, or leave it empty to connect the root directory. 
6. Click **TEST** to make sure you can connect to the file hosting, then click **OK** to save the connection.


## See also

* [Browse files](/help/access/files/browse-files.html)
* [Share a connection](TODO)
