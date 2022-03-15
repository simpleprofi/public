# Files and file hostings

Datagrok provides out-of-the-box connectors for the following file hosting services:

* Dropbox
* Google Cloud 
* Git
* GitHub
* Amazon S3
* Local directory

<!--
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
-->

## Connect a file hosting service

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


## Connect a file share

You can use a file share mounted on the Datagrok server as a data source. 
All files in the shared directory become available in the Datagrok UI, and you can open supported file formats as tables.

To add a file share, follow the steps for [connecting a file hosting](#connect-a-file-hosting-service) and select **Files** as the **Data Source** in the connection parameters dialog.
The following table describes the parameters of the Files connector:

| Parameter            | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| Data Source       | For file shares, this field should be set to "Files".          |
| Name              | The name that is used to identify the folder in the Datagrok UI.                          |
| Dir               | The source directory on the Datagrok server. |
| Index Files       | Select this option to enable file indexing. |
| Credentials owner | Name of the Datagrok user who owns the files and folders from the data source      |
| Login             | Login to the data source                                                           |
| Password          | Password to data source                                                            |


## Upload a file

You can upload a file into Datagrok from your computer. 
Simply drag and drop a file into the Datagrok UI or, from the menu, select **File** > **Open** > **File...**. Any supported file format is converted into a table and you can start analyzing your data right away.

Note that the files imported to the Datagrok UI are not automatically uploaded to the server. The data stays in the browser, and Datagrok will lose the file when you close the browser tab.
If you want to save the file on the server, there are two options:

* You can upload the file directly to the [Datagrok home directory](todo). 
* [Create a project from the uploaded file](todo) and save the project on the server. 

<!--
## Index files
-->


## What's next


* [Browse and share files](#)
