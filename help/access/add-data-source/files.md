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

    * Click **Open** (![Open](/help/images/open-icon.png)) > **Files** and then click **New file share**. In the **Data Source** field, select a file hosting and enter connection parameters. 

        ![Connect a file hosting](/help/images/access/connect-file-hosting.gif)

    * From the menu, select **File** > **Connect to Data...**. 
        In the list of connectors, right-click on the icon for the file hosting you want to connect and select **Add connection...**.

<!---
    ![File share properties](/images/access/file-share-properties.png)
    --->

2. Enter connection properties and click **TETS** to make sure you can connect to the file hosting. 
Click **OK** to save the connection.


## Connect a file share

A file share is a directory on the Datagrok server that you can set up to have access to from Datagrok. 

## Upload a file

You can upload a file from your computer. 
Drag and drop a file into the working area in Datagrok, or, from the menu, select **File** > **Open** > **File**.
Any supported file format is converted into a table and you can start analyzing your data.
Note that in this case the data is not uploaded to the server but stays in the browser. 
Datagrok will lose the data when you close the browser tab.

If you want to save the file on the server, there are two options:

* You can upload the file directly to the [Datagrok home directory](todo). 
* [Create a project from the uploaded file](todo) and save the project on the server. 

<!--
## Index files
-->


## What's next


* [Browse and share files](#)
