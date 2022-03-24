# Files and file hostings

Datagrok provides out-of-the-box connectors for the following file hosting services:

* Dropbox
* Google Cloud 
* Git
* GitHub
* Amazon S3
* Local directory


## Supported file formats

| Extension     | Description              |
|---------------|--------------------------|
| csv, tsv, txt | Comma-separated file     |
| xml           | XML                      |
| json          | JSON                     |
| HTML          | HTML                     |
| xlsx          | Excel file               |
| edf           | European Data Format     |
| sas7bdat      | SAS                      |
| kml, kmz      | Geographic annotations   |
| rds, rda      | R Data Format            |
| h5            | Hierarchical Data Format |
| nc            | NetCDF                   |
| mat           | MATLAB MAT               |
| d42           | Datagrok project         |
| zip           | ZIP                      |
| gz, gzip      | gzip                     |
| tar           | tar                      |
| ipynb         | Jupyter Notebook         |


## Import a file

You can import a file into Datagrok from your computer. 
Simply drag and drop a file into the Datagrok UI or, from the menu, select **File** > **Open** > **File...**. Any supported file format is converted into a table and you can start analyzing your data right away.

Note that the files imported to the Datagrok UI are not automatically uploaded to the server. The data stays in the browser, and Datagrok will lose the file when you close the browser tab.
If you want to save the file on the server, there are two options:

* You can upload the file directly to the [Datagrok home directory](#datagrok-home-directory). 
* [Create a project from the uploaded file](todo) and save the project on the server. 

## Connect to a file hosting service

1. To connect a file hosting service, configure the appropriate connector. You can do it in the following two ways:

    * In the left-hand sidebar, click ![Open](/help/images/open-icon.png) > **Files** and then click **New file share**. In the **Data Source** field, select a file hosting and enter connection parameters. 

        ![Connect a file hosting](/help/images/access/connect-file-hosting.gif)

    * From the menu, select **File** > **Connect to Data...**. 
        In the list of connectors, right-click on the icon for the file hosting you want to connect and select **Add connection...**.

<!---
    ![File share properties](/images/access/file-share-properties.png)
    --->

2. Enter connection parameters and click **TEST** to make sure you can connect to the file hosting. 
Click **OK** to save the connection.


## Connect to a file share (SMB)

You can use a file share mounted on the Datagrok server as a data source. 
All files in the shared directory become available in the Datagrok UI, and you can open supported file formats as tables.

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


## Browse files in the Datagrok UI

Datagrok comes with a built-in file browser that lets you navigate and view all files uploaded by you, retrieved via configured file connectors, or shared with you by other users. 
Files and folders are displayed as a tree view, and you can open a file by double-clicking on it.

You can open the file browser from the left-hand sidebar by clicking ![Open](/help/images/open-icon.png) > **Files**. 

![File browser](/help/images/access/file-browser.png)

Double-clicking on a supported file format opens the file in the Datagrok UI. 
For other file formats, you are prompted to download the file.


### Datagrok home directory

Each Datagrok user has a home directory, which is accessible in the file browser under the name "Home". 
The home directory is a connection to a file hosting (Amazon S3) that is created automatically when a user signs up. 
You can use it to store files imported from your computer. 
To upload a file, open the home directory in the Datagrok UI and drag and drop the file into it.

