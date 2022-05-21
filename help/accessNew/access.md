# Data access v.2

The process of data analysis and data processing starts with getting the data. Datagrok provides an access to pretty much everything that is machine readable. Use it to access your local [files](), [databases](), and [web services](). ToDo: Add few more sentences here

*note: If anything is missing, it could be implemented as a platform extension.*

## Data sources

In Datagrok you can access and operate with the data located on or produced by different data sources. Here is the list of currently available options:

* [Files](#Files) 
* [Databases](#Databases)
* [Web services](#Web-services)
* [Queries](#Queries)
* [Projects](#Projects)
* [Text](#Text)
* [Functions](#Functions)

## Files

Datagrok support a variety o file formats including tabular and molecular file formats. Here is the list:

### Tabular formats

| Extension  | Description                                      | 
|------------|--------------------------------------------------|
| .txt       | Plain text                                       | 
| .csv       | Comma-separated values                           | 
| .tsv       | Tab-separated values                             | 
| .xml       | Extensible Markup Language                       | 
| .json      | JavaScript Object Notation                       | 
| .HTML      | HyperText Markup Language                        | 
| .xlsx      | Excel                                            | 
| .edf       | European Data Format                             | 
| .sas7bdat  | SAS database file                                | 
| .kml, .kmz | Keyhole Markup Language (geographic annotations) | 
| .rds, .rda | R Data Format                                    | 
| .h5        | Hierarchical Data Format                         | 
| .nc        | NetCDF                                           | 
| .mat       | MATLAB MAT                                       | 
| .d42       | Datagrok [project](../overview/project.md)       | 
| .zip       | ZIP archive                                      | 
| .gz, .gzip | gzip                                             | 
| .tar       | Tape archive                                     | 
| .ipynb     | Jupyter Notebook                                 | 


### Molecular formats

| Extension | Description                        | 
|-----------|------------------------------------|
| .cif      | Crystallographic Information File  |
| .pdb      | Protein Data Bank                  |
| .pqr      | PQR                                |
| .gro      | GROMACS                            |
| .sdf      | Structure-data file                |
| .mol      | MDL Molfile                        |
| .mol2     | SYBYL molecule representation      |
| .mmtf     | Macromolecular Transmission Format |

note: for using molecular formats you'll need a nglviewer plugin

### Working with files

To start working with files you need to add them to Datagrok application first.

![](https://i.imgur.com/RoyQQwp.png)

Datagrok operates with both, files stored locally on your machine and with the cloud-based ones.

There are two ways to add a file stored on your local machine:

1. Click on **Open local file** on the toolbox menu and choose a file you want to add.
2. Drag a file from anywhere on your hard drive and drop it to one of the folders in Datagrok **Files** directory. 

In order to add data stored in a cloud-based storage, you need to create a **File share**.

### File share

File share represents a connection between Datagrok and your files on a cloud storage. Once you create a file share your cloud-based data will appear in the **Files** folder.

To create a file share, do the following:

![](https://i.imgur.com/gHbytiG.png)

1. Navigate to **Data**➝**Actions**
2. Click **New file share**
3. Select the type of cloud-based storage your files are located on
4. Fill out the credentials and click **OK**

___
**Note:** There are six file share options available in Datagrok:

* Dropbox
* Files
* Git
* Github
* Google Cloud
* Amazon S3

You can create a new custom connection if needed. To create a custom connection make a pull request to Datagrok public repository or [contact us]() for assistance.
___

### Files and folders sharing

![](https://i.imgur.com/ZILc6Vx.png)

If you are working in a team you will need a way to share data with your colleagues. In Datagrok you can do that in a few clicks. There are two sharing options available:

* Share a file
* Share a file as a data table

### Share a file

To share a file, do the following:

![](https://i.imgur.com/JdclGFn.png)

1. Navigate to the file you want to share in a Datagrok file browser
2. Double click the file to open it
3. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Fo07hLZ.png)</span> icon on the left hand side
4. Choose **File** sharing option
5. Enter the user name, group name, or email address of the user(s) you want to share your data with
6. Choose the permissions type from the drop down
7. If you want to notify users about sharing your files, hit the **Send notifications** checkbox and add a notification message to the typing area
8. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Sk2L9Yr.png)</span> icon to copy the link to your file
9. Click **OK** to confirm changes
10. Send the link you've copied to the users you want to share your file with

### Share a file as a data table


To share a file as a data table, do the following:

![](https://i.imgur.com/E9sDfcc.png)


1. Navigate to the file you want to share in a Datagrok file browser
2. Double click the file to open it
3. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Fo07hLZ.png)</span> icon on the left hand side
4. Choose **Data** sharing option
___
**Note:** Pay attention to the **Data sync** flag. It defines if users receive a static or real-time updated data. Once turned on, users will receive a fresh  data each time they re-open the file.
___

5. Click **OK** to upload your file and make it accessible by other users
6. Enter the user name, group name, or email address of the user(s) you want to share your data table with
7. Add an optional notification message, and click **OK**. Datagrok will send a link to your data table and notification message to the selected users automatically.

**ADD**:

* file system browser->file system browser structure
* file context menu
* file access privileges
* data preview pane->folder preview/file preview (not only tabular structure but also the code view with highligts) (maybe)

## Databases

## Database connections

Datagrok provides a way to connect to pretty much any database out of the box. We support more than 30 of them, and its
simple to add a new connector with some custom development.

Adding a new connection is as simple as adding a [file share](). In a similar way, hit a
`New Connection` command on the left, choose the type of the provider, and then depending on the provider different
login credentials are required. Login credentials are stored in a separate secured vault in an encrypted way which can
only be decrypted with your login credentials — we thought about it a lot.

Also, all the connections to the databases as well as connections to file systems are also subject of privileges and
security checks. Each connection and sharable object has a panel called "Sharing". Expand it to see who has privileges.
It is easy to share it with a particular group or an individual and provide a level of access needed.

## Exploring a database

Once a connection to the database is created, there are multiple ways to connect, explore and work with that database.
Let's look at what we could do on the exploration side.

### Preview the table data

Under each connection we see a Node.js called `Tables`. It all depends on the provider, where some providers also
support `Schemas`. The simplest way is to simply click on the table and expand contents of it. By default, it shows the
first 50 rows, so it isn't going to take a lot of time to load the data preview. We find it a very useful tool for just
checking what is in the database. The content is in our dataframes and data spreadsheet, so that you can already do some
basic data profiling already at that data preview. If the data contains some molecules or other user-defined types, we
would see these data types rendered in the preview.

### Explore columns

In the below section properties for each column are displayed. In addition to some general information, such as names,
types and additional metadata, there is also a way to quickly inspect it with the basic descriptive statistics.

## Query the database visually

### Querying by aggregation

For example, let us do a couple of visual queries against the `Orders` table of the celebrated
`Northwind` database. Let us right-click on the `Orders` table to which we navigated and select a `Visual Query`
command. What this particular tool does is it lets you create an aggregation query against a particular table visually.

While the functionality for joining tables is not yet available and comes later, it is often possible to add a view to
the actual database and then interrogate this view from the `Visual Query`
tool.

Building an aggregate query is easy. Start with the `Measures` section. For example, we select an average of `freight`,
and the result appears instantaneously. It is a nice way to explore datasets which don't fit in the browser's memory, or
something where you know in advance what you are looking for.

It is possible to change a measure of the aggregation by right-clicking on it and selecting the measure in interest,
such as choosing a `sum` instead of an `avg`. Same applies to the column by which the aggregation is being computed.

To group by different columns, use the `Rows` section of the dialog. For example, let us group by `Country` and then
by `City`.

### Data pivot

On of the popular features when people query data is the ability to pivot it, essentially put values in columns. We
support this feature with the `Columns` field. As an example, let us select the ...

### Querying by joining

Another popular way of querying the database is the one when you start with particular table and then join particular
attributes using left join which are related to that table.

For example, ...

Right-click on the table and choose `Build Query`. Our platform figures out the schema of the database, and starting
from that table it adds all the tables that could be reached by following the foreign keys.

# DB exploration

Datagrok supports visual exploration of relational databases for some of the database providers, including PostgreSQL,
MySQL, MS SQL, Maria DB, and Oracle. If a provider supports it, you'll see '
Browse schema' command for the corresponding connection:

## Schema browser

Schema browser visualizes all tables with all columns at once, giving you a high-level overview of the database. Click
on a table to see its details in the property panel; it is also a good starting point for drill-downs and further
exploration. The following quick actions are there:

## Hierarchy browser

Datagrok lets you visually explore both database schema and database content. Simply click on the item (
such as connection, table, or column) in the "File | Connect to data" pane to bring up item's properties in
the [property panel](../overview/navigation.md#properties).


### Context actions for db columns

In case you want to retrieve only some of the columns, select them (Shift+click) in the schema, and then use context
actions that appear in the property panel

## Projects

Project is a collection of entities along with the applied visualizations. Projects are used to group and share data and
other assets with other users. One of the most common applications of projects are dashboards that consist of tables (
with either static or dynamic data), and visualizations applied to them.

### Uploading a project

Creating a project is easy. After getting the data of interest in the scratchpad project in [workspace](workspace.md),
click on the `UPLOAD` button. After the project gets uploaded to the server, a separate window pops us asking you whom
to share the project with. By default, it is only accessible by you, you have to share it in order for others to use it.

Or, if you are editing an existing project, click `SAVE` to save your changes.

Use `Share` context action to edit access permissions. Sharing a project will automatically share all entities and data
inside.

### Dynamic data

Whenever a table is created by executing a [function](../overview/functions)
(such as a [database query](../access/data-query.md)), this information gets stored with the table as a "generation
script". This serves multiple purposes:

* Provides data lineage
* On-demand data refreshing (Table toolbox, "Query" panel, `REFRESH` button)
* Enables publishing dashboards with the dynamic data

In the "Upload project" dialog, a "Data sync" option appears next to the tables that have a generation script defined.
This option determines whether the data should be stored as a static snapshot, or as a generation script. In the latter
case, the function will be re-executed whenever the project is opened.



### Project types

Projects are organized in a tree structure. Rights on particular [entities](objects.md) are inherited based on this
hierarchy. There are two main types of projects: _root_ and _regular_. Root projects can contain one or more non-root
projects, for example, the link `Demo:CoffeeCompany`
indicates that the `CoffeeCompany` project is part of the root project `Demo`. Any link to an entity on the platform
starts with the root project. And since an entity can have only one canonic address, other related projects will
reference the link rather than the entity itself. This fact becomes important in the context of regular projects. As the
name suggests, they are the most common ones
(that's what users create by default). Entities from such a project belong to the higher-level namespace, which means
they are tied to the root project. To find out where an entity comes from, see `Links` in the `Details` tab of the
property panel.

Root projects are automatically created for users and packages. When the user uploads a project, it gets saved to their
namespace. However, the existing entities will be available in the user's project via link. As for packages, each
version has its own project, which allows sharing packages on a version level.

### Project gallery

Browse projects that are available to you. Use [Smart search](smart-search.md) for powerful filtering capabilities.

Click on the context menu to the left of the search box to control sort order, as well as access your recent searches.

Controls:

|              |                        |
|--------------|------------------------|
| Click        | Show in property panel |
| Right click  | Context menu           |
| Double click | Open                   |

### Filtering

The following fields could be used to filter projects with [smart search](smart-search.md):

| Field        | Description                                 |
|--------------|---------------------------------------------|
| name         |                                             |
| description  |                                             |
| createdOn    |                                             |
| updatedOn    |                                             |
| author       | [User](../govern/user.md) object            |
| starredBy    | [User](../govern/user.md) object            |
| commentedBy  | [User](../govern/user.md) object            |
| usedBy       | [User](../govern/user.md) object            |


## Text

# Import text

Use this feature for finer control of the import options, as well as text editing.

Any changes made to the text or to the options are automatically applied, unless 'Auto sync' option is off. The preview
of the data is in the bottom pane.

Datagrok tries to auto-detect parameters automatically, so vast majority of the datasets can be imported by simply
dragging that file into the browser window, or opening it via the **File | Open (
Ctrl+O)** command.

Options and commands:

|                     |                                                                |
|---------------------|----------------------------------------------------------------|
| Delimiter           | Field separator                                                |
| New line            | New line                                                       |
| Decimal separator   | Decimal separator                                              |
| Thousands separator | Thousands separator                                            |
| Headers             | Treat first line as headers                                    |
| Auto sync           | Parse data on every change (might be slow if the table is big) |
| Load                | Load file                                                      |
| Sync                | Force synchronization                                          |
| Done                | Add the table to the workspace                                 |

# Functions as data sources

Functions or scripts could be executed differently from different places, they can also be executed in the browser or on
the server.

## Generating demo datasets

Let's look at the example. A function that returns a test dataset.

## Obtaining outputs from the functions

Any script written in Python or R.

Example: mutate a molecule with a script. UI for the parameters is being generated automatically.

Generation script when the data tables get reinstantiated. Basis for developing dashboards. Data sync.