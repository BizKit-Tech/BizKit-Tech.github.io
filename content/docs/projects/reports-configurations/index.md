---
title: "Reports Configurations"
description: ""
lead: "Author/s: Rhuver Joshua Pedere"
date: 2023-10-02T11:10:14+08:00
lastmod: 2023-10-04T17:28:34+08:00
draft: false
images: []
menu: 
  docs:
    parent: "projects"
weight: 999
toc: true
---

## Reports Configurations
### Overview

The "Reports Configurations" feature has been introduced to empower clients to tailor their report consumption experience according to their unique business needs. Reports, crucial tools for decision-making, may not always require the same data or presentation. A flexible solution is provided, allowing each client to customize report filters and columns to align with their preferences.

Traditionally, Script Reports were designed with a one-size-fits-all approach. However, differing client requirements must be addressed. For instance, certain filters or columns may be deemed irrelevant to some clients, while others may prefer to modify column labels for better alignment with their operations. This feature addresses these variances by enabling per-client configuration of reports.

### Reason for Feature Inclusion

The inclusion of this feature enables per-client configuration of reports. Each client possesses unique preferences regarding report consumption. Some clients may opt to conceal specific filters or columns, irrelevant to their business needs. Conversely, others may choose to relabel specific columns to enhance context for their business operations.

### Changes Made

#### Upon Loading the Report Document Form
{{< img src="image-6.png" alt="On Load of the Report Document Form 1" class="border-0" >}}
An implementation has been added in `before_load` Form Event within report.js to fetch filters and pass them to the backend.

{{< img src="image-7.png" alt="On Load of the Report Document Form 2" class="border-0" >}}
The filters from the request are used to load the filters and columns tables.

{{< img src="image-8.png" alt="On Load of the Report Document Form 3" class="border-0" >}}
 
Comparison between the set of filters retrieved from the JavaScript (js) file and those obtained from the database is performed. If identical, no changes are made. However, discrepancies, such as the addition of a new filter to the js file, trigger the loading of the new filter set into the database.

{{< img src="image-9.png" alt="On Load of the Report Document Form 4" class="border-0" >}}

This step closely mirrors the `load_filters` step mentioned previously. The key distinction lies in its initial utilization of filters, particularly their default values, for column retrieval. Subsequently, it compares the set of columns obtained from the Python (py) file with those retrieved from the database. Similarly, if identical, no changes occur. However, disparities, such as the addition of a new column to the py file, lead to the loading of the new column set into the database.

{{< img src="image-4.png" alt="On Load of the Report Document Form 5" class="border-0" >}}

An attempt is made to execute the `get_configurable_columns` function within the report module's py file. A successful execution results in `has_dynamic_columns` being set to `0`, and `columns` being populated with the list returned by `get_configurable_columns`. Failure leads to `has_dynamic_columns` being set to `1`, and `columns` being assigned an empty list.

Following this, we also endeavor to execute the `get_columns` method, passing the default filter values as the first argument. Success sets `has_dynamic_columns` to `0`, with `columns` populated by the list returned by `get_columns`. Failure results in `has_dynamic_columns` being set to `1`, with `columns` assigned an empty list.

Subsequent to the two function call attempts mentioned above, the list from `get_configurable_columns` is assessed. If non-empty, it is returned as the result. However, if it is empty, the list from `get_columns` is passed, regardless of its emptiness.

At this juncture, `has_dynamic_columns` is set to `0` only if the execution of `get_columns` yields a non-empty list; otherwise, it is set to `1`.

#### Upon Loading the Report View
{{< img src="image-5.png" alt="On Load of the Report View" class="border-0" >}}

While loading the report view, a check is included to determine if the report doc's `enable_filters_and_columns` property is set to `1`. If so, filter configurations are applied; otherwise, only filters from the JavaScript (js) file are retrieved. Subsequently, a report refresh is initiated.

During the refresh process, a server call to the `run` function in the `query_report.py` file is triggered, subsequently invoking the `execute` function in the Python (py) file of the currently rendered report. Here, verification is conducted to ascertain whether the report doc's `enable_filters_and_columns` property is set to `1`, and column configurations are applied prior to returning the result.

### Utilizing the Feature
{{< figure src="example.gif" alt="Utilizing the Feature" width="100%" >}}

1. Navigate to the Report List.
2. Open a Script Report document Form.
3. Adjust the filter and column configurations.
4. Verify that `Enable Filters and Columns Configuration` is enabled.
5. Save your modifications.
6. Access the Report View.

### Testing
- [Summary](https://app.clickup.com/t/865cwwyjc?comment=90080051624998)
- [Test Cases](https://docs.google.com/spreadsheets/d/16IeQIgDSaPtXUXdGaxYxj3xapZK1GgSc/edit#gid=1215479650)

### Limitations

#### Dependency on `get_columns`
{{< img src="image-2.png" alt="Feature is dependent on the get_columns function" class="border-0" >}}

This feature heavily relies on consistency in coding practices. It presupposes that all Python files for standard reports adhere to a standardized pattern. Specifically, the absence of the `get_columns` function in the Python file associated with a report leads to the assumption of dynamic columns. Conversely, if the `get_columns` function exists, an attempt is made to execute it using default filter values as parameters. If execution fails, it is also assumed that the report employs dynamic columns.

#### Maintenance of `get_configurable_columns`
{{< img src="image-1.png" alt="Maintenance of get_configurable_columns" class="border-0" >}}

For reliable utilization of the feature in conjunction with dynamic columns, it is imperative to retain the `get_configurable_columns` function. This facilitates the configuration of non-dynamic columns within the complete column list.

#### Alterations in the JSON File of Individual Reports
{{< img src="image.png" alt="File changes in the JSON file of individual reports" class="border-0" >}}

This feature introduces new docfields to the Report Doctype. It's crucial to note that the default behavior of the Report Doctype involves storing row values of a report document in a JSON file. Consequently, older reports do not include these newly introduced docfields in their respective JSON files. When a user accesses a specific report from the Report List, this action triggers an update process, adding the new fields to the report's dedicated JSON file. Therefore, even if a user merely opens a Report document form without making any changes, file alterations will be observed.

#### Unavailability of the Feature in Query Reports
{{< img src="image-3.png" alt="Feature is not available on Query Reports" class="border-0" >}}

Query reports lack JavaScript (js) and Python (py) files for use as references in defining filters and columns. Parsing the value of the Query/Script text field is unreliable.

### Future Improvements

In future iterations, comprehensive testing may be necessary. Additionally, it's vital to consider testing the functionalities used by developers. Current testing efforts primarily focus on end-user functionalities. Developers interact with the Report Doctype when creating or modifying reports, involving changes to JavaScript (js) or Python (py) files. Hence, assessing the potential for disruptions when modifying these files is critical.

Consideration should also be given to addressing some, if not all, known limitations of this feature.

### References

- [Task Card](https://app.clickup.com/t/865cwwyjc)
- [Discord discussion](https://discord.com/channels/583992942612447252/1133033028151676928)
- PRs:
   - [Original PR](https://github.com/BizKit-Tech/frappe/pull/145)
   - [PR for modification of the reports' python file boilerplate](https://github.com/BizKit-Tech/frappe/pull/148)
   - [Bugfix PR 1](https://github.com/BizKit-Tech/frappe/pull/158)
   - [Bugfix PR 2](https://github.com/BizKit-Tech/frappe/pull/161)
