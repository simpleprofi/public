# Connect to a file share (SMB)

You can use a file share mounted on the Datagrok server as a data source and browser files in the file share from the Datagrok UI. 
This type of connection is available when you run an instance of Datagrok within your own infrastructure and is not available in the public Datagrok instance (public.datagrok.ai).


To connect to a file share: 

1. In the left sidebar, click ![Open](/help/images/open-icon.png) > **Files** and then click **New file share** under the **Actions** label. 
This opens the **New file share** dialog. 

    ![New file share](/help/images/access/file-share-properties.png)

2. Enter connection parameters for the file share.

    | Parameter         | Description  |
    | ----------------- | ------------------------------------------------ |
    | Data Source       | For file shares, this field should be set to "Files".        |
    | Name              | The name that identifies the folder in the Datagrok UI.      |
    | Dir               | The source directory on the Datagrok server. |
    | Index Files       | Select this option to enable file indexing. |
    | Credentials owner | A group of users who can change the credentials for this connection. |
    | Login             | The login to the file share.         |
    | Password          | The password to the file share.         |

3. Click **TEST** to verify that you can connect to the file share, then click **OK** to save the connection.


## See also

* [Browse files](/help/access/files/browse-files.html)
* [Share files and folders]()
