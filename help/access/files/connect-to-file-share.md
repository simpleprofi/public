# Connect to a file share (SMB)




You can use a file share mounted on the Datagrok server as a data source and browser files in the file share from the Datagrok UI. 
This type of connection is available when you run an instance of Datagrok within your own infrastructure and is not available in the public Datagrok instance (public.datagrok.ai).

To add a file share, follow the steps for [connecting a file hosting](#connect-a-file-hosting-service) and select **Files** as the **Data Source** in the connection parameters dialog.
The following table describes the parameters of the Files connector:

| Parameter         | Description  |
| ----------------- | ------------------------------------------------ |
| Data Source       | For file shares, this field should be set to "Files".        |
| Name              | The name that identifies the folder in the Datagrok UI.      |
| Dir               | The source directory on the Datagrok server. |
| Index Files       | Select this option to enable file indexing. |
| Credentials owner | A group of users who can change the credentials for this connection. |
| Login             | The login to the file share.         |
| Password          | The password to the file share.         |


