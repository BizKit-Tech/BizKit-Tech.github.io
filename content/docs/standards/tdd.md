---
title: "Test-Driven Development Guidelines"
description: "Know more about our guidelines when writing and running unit tests."
lead: "Author/s: Gab Barbudo, Celyn Raquel"
date: 2023-07-05T14:30:18+08:00
lastmod: 2023-07-05T14:30:18+08:00
draft: false
images: []
menu:
  docs:
    parent: "standards"
weight: 302
toc: true
---

# 1 Background

**Test-driven development (TDD)** is a software development approach in which tests are written for a piece of code before the code itself is written. The idea is that by writing the tests first, you can define the desired behavior of the code and ensure that it works as expected.

# 2 Key Features

There are several key features of test-driven development that are important for beginners to understand:

1. The idea that tests are written before the code itself is written. This ensures that the code is written to satisfy the requirements of the tests, rather than the other way around.
2. The use of automated testing tools to run the tests and check the results. This allows for efficient and repeatable testing, and ensures that the tests always run in the same way.
3. The practice of writing tests for each piece of functionality that is added to the code. This helps to ensure that the code is written in a modular and testable way, and allows for efficient debugging if something goes wrong.
4. The concept of test-driven development as a feedback loop. The tests are used to check the code and provide feedback on its behavior, which can then be used to improve the code and make it more reliable.

# 3 TDD vs QA’s Job

Unit testing in test-driven development (TDD) and testing done by quality assurance (QA) are two different approaches to testing software. In general, unit testing in TDD is **focused on testing individual units of code**, while testing done by QA is focused on testing the overall functionality and quality of the software.

Unit testing in TDD is a software development practice in which developers write small, granular tests that test individual units of code before writing the code itself. This helps to ensure that the code is working as expected and helps to catch and prevent bugs from being introduced into the code.

Testing done by QA, on the other hand, is typically done after the code has been written. QA testers use a variety of techniques and tools to test the overall functionality and quality of the software, including manual testing, automated testing, and performance testing. QA testing is focused on ensuring that the software is working correctly from the user's perspective and meets the requirements and standards set by the development team.

Overall, TDD and QA testing are complementary approaches to testing that serve different purposes in the software development process. While TDD focuses on writing small, focused tests that are written by the developer, QA testing is often focused on more comprehensive testing of the application as a whole. Both approaches can help to ensure the quality of the code and improve the overall user experience of the application.

# 4 Setting Up

There are two files needed to be maintained to track BizKit-updated tests: an `updated_doctypes.txt` and an `updated_modules.txt` under the `erpnext/erpnext/tests` folder. These are where we maintain DocTypes and modules (whose classes are not directly associated to a DocType e.g., `TestPurchaseOrderTransactionItemBinUpdater`) with our updated tests.

DocTypes in the `updated_doctypes.txt` are written like their labels, and are separated by line breaks:

```txt
Item
Purchase Order
Purchase Invoice
```

Modules in the `updated_modules.txt` are dotted relative paths to the modules, and are separated by line breaks:

```txt
erpnext.transactions.transaction_bin_updater.buying.purchase_order.test_purchase_order_transaction_bin_updater
erpnext.transactions.transaction_bin_updater.buying.purchase_invoice.test_purchase_invoice_transaction_bin_updater
```

# 5 Writing Unit Tests

There are two things discussed in this section:

1. Creating and deleting documents using the designed static methods to be used in unit tests
2. Writing the actual unit tests

## 5.1 Creating and Deleting Documents

These five static methods should be present in the `Test` class of a DocType (e.g., `TestItem`), which is a subclass of the `unittest.TestCase`:

1. `setup_prerequisites`
2. `create`
3. `destroy`
4. `destroy_all`
5. `destroy_prerequisites`

These are set up as static methods (using the `@staticmethod` decorator) to eliminate the need to instantiate the whole `unittest.TestCase` class every time they are called:

```python
class TestItem(unittest.TestCase):
  @staticmethod
  def setup_prerequisites():
    pass
```

### 5.1.1 setup_prerequisites

This method creates the necessary documents that need to be linked to the current document being created. For example, for an Item document, the following links are present:

- Item Group (required)
- UOM in the `uoms` table
- Supplier in the `supplier_items` table (optional but frequently set)
- Customer in the `customer_items` table (optional but frequently set)

For required links, these are made positional arguments in the `setup_prerequisites` method, while those that are not required are made keyword arguments:

```python
class TestItem(unittest.TestCase):
  @staticmethod
    def setup_prerequisites(
        item_group_name, suppliers=[], customers=[], uoms=[]
    ):
        TestItemGroup.create(item_group_name)

        for customer in customers:
            TestCustomer.create(customer_name=customer)
        for supplier in suppliers:
            TestSupplier.create(supplier_name=supplier)

        for uom in uoms:
            TestUOM.create(uom)
```

In the code above, the `item_group_name` parameter is required, while the `suppliers`, `customers`, and `uoms` parameters have default values that evaluate to a `False` Boolean. Inside the `setup_prerequisites` method, the `create` methods of the linked DocTypes are called based on the arguments passed.

### 5.1.2 create

This method creates an instance of the current DocType. The parameters of `create` methods are: the names of link fields that are **required** (unless frequently set), and the `do_not_save` parameter:

```python
class TestItem(unittest.TestCase):
    @staticmethod
    def create(
        item_name="_Test Item",
        item_group="_Test Item Group",
        item_description="_Test Item",
        stock_uom="Piece",
        uoms=[{"uom": "Piece", "conversion_factor": 1}],
        do_not_save=0,
    ):
        TestItem.setup_prerequisites(
            item_group, suppliers, customers, [uom["uom"] for uom in uoms]
        )

        if not frappe.db.exists("Item", {"item_name": item_name}):

            supplier_list = frappe.db.get_list(
                "Supplier", filters={"name": ["in", suppliers]}, pluck="name"
            )

            customer_list = frappe.db.get_list(
                "Customer", filters={"name": ["in", customers]}, pluck="name"
            )

            new_item = frappe.new_doc("Item")
            new_item.item_code = item_name
            new_item.item_description = item_description
            new_item.item_name = item_name
            new_item.item_group = item_group
            new_item.stock_uom = stock_uom

            for uom in uoms:
                new_item.append("uoms", uom)

            if not do_not_save:
              new_item.save()

            return new_item
        else:
            item_docname = frappe.db.exists("Item", {"item_name": item_name})
            return frappe.get_doc("Item", item_docname)
```

The design of the `create` method follows the [Singleton pattern](https://refactoring.guru/design-patterns/singleton), wherein there is only one instance of the object you're looking for. In the code, we specify the `item_name` and other parameters that make the Item document unique. If that specific Item exists, it returns that existing Item. Otherwise, it creates a new one with the specified attributes and returns it.

For non-transactions with less fields and links, the parameters are defined in the `create` method definition, like the one shown above. On the other hand, for transactions (e.g., Purchase Order, Sales Order), since there are too many fields and links in those documents, the parameters in their `create` methods are compressed into `**args`. The `**` is necessary to be able to access the arguments passed like a dictionary.

Here is an example:

```python
class TestPurchaseOrder(unittest.TestCase):
    @staticmethod
    def create(**args):
        args.setdefault("item_name", "_Test Item")
        args.setdefault("company", "_Test Company")
        args.setdefault("supplier", "_Test Supplier")
        args.setdefault("set_warehouse", "_Test Warehouse - _TC")
        args.setdefault("tax_category", "_Test Tax Category")
        args.setdefault("qty", 1)
        args.setdefault("price_list_rate", 100)
        args.setdefault("rate", 100)

        TestPurchaseOrder.setup_prerequisites(
            item_name=args.get("item_name"),
            company_name=args.get("company"),
            supplier_name=args.get("supplier"),
            warehouse_name=args.get("set_warehouse").split(" - ")[0],
            company_abbr=args.get("set_warehouse").split(" - ")[1],
            tax_category_title=args.get("tax_category"),
        )

        item = frappe.db.exists("Item", {"item_name": args.get("item_name")})
        item = frappe.get_doc("Item", item)

        new_po = frappe.new_doc("Purchase Order")
        new_po.supplier = args.get("supplier")
        new_po.company = args.get("company")
        new_po.transaction_date = date.today()
        new_po.set_warehouse = args.get("set_warehouse")
        new_po.tax_category = args.get("tax_category")
        new_po.append(
            "items",
            {
                "item_code": item.item_code,
                "item_name": args.get("item_name"),
                "schedule_date": date.today() + timedelta(days=7),
                "description": item.description,
                "qty": args.get("qty"),
                "stock_uom": item.stock_uom,
                "uom": item.stock_uom,
                "conversion_factor": 1,
                "price_list_rate": args.get("price_list_rate"),
                "rate": args.get("rate"),
                "amount": args.get("qty") * args.get("rate"),
            },
        )

        if not args.get("do_not_save"):
            new_po.save()
            new_po.reload()
            if not args.get("do_not_submit"):
                new_po.submit()

        return new_po
```

In the code above, the following steps are followed:

1. In setting the default values for these parameters, the `setdefault` method is used on the `args` dictionary (e.g., `args.setdefault("item_name", "_Test Item")`):

```python
args.setdefault("item_name", "_Test Item")
args.setdefault("company", "_Test Company")
args.setdefault("supplier", "_Test Supplier")
args.setdefault("set_warehouse", "_Test Warehouse - _TC")
args.setdefault("tax_category", "_Test Tax Category")
args.setdefault("qty", 1)
args.setdefault("price_list_rate", 100)
args.setdefault("rate", 100)
```

2. The `setup_prerequisites` method of the current class is called, passing the necessary arguments (links in the DocType):

```python
TestPurchaseOrder.setup_prerequisites(
    item_name=args.get("item_name"),
    company_name=args.get("company"),
    supplier_name=args.get("supplier"),
    warehouse_name=args.get("set_warehouse").split(" - ")[0],
    company_abbr=args.get("set_warehouse").split(" - ")[1],
    tax_category_title=args.get("tax_category"),
)
```

3. There are times when the linked document is not named based on a specific field (e.g., Item can be named in different ways which can be set in the Stock Settings). To properly pull the item created as a prerequisite, we use the `frappe.db.exists` method first to get the Item docname then that is passed as an argument to the `frappe.get_doc` method to get the Item object itself.

```python
item = frappe.db.exists("Item", {"item_name": args.get("item_name")})
item = frappe.get_doc("Item", item)
```

4. The specific arguments passed are accessed using the `args.get()` method (e.g., `args.get("item_name")`):

```python
new_po.supplier = args.get("supplier")
new_po.company = args.get("company")
```

5. Transactions' `create` methods have additional `do_not_save` and `do_not_submit` parameters, the default values of which evaluate to `False` (`None`):

```python
if not args.get("do_not_save"):
    new_po.save()
    new_po.reload()
    if not args.get("do_not_submit"):
        new_po.submit()
```

6. The resulting transaction is returned.

> **Note:** In the `create` method shown above, we do not check whether or not the Purchase Order exists already. This is because every Purchase Order or transaction cannot be reused.

### 5.1.3 destroy

This method is used to delete the current document and possibly its prerequisites. It takes in the argument that identifies the unique document and the additional `destroy_prerequisites` argument (which we'll touch on below):

```python
class TestItem(unittest.TestCase):
    @staticmethod
    def destroy(item_name, destroy_prerequisites=False):
        if not item_name:
            TestItem.destroy_all()

        item = frappe.db.exists("Item", {"item_name": item_name})
        if item:
            item_doc = frappe.get_doc("Item", item)
            frappe.delete_doc("Item", item)

            if destroy_prerequisites:
                frappe.delete_doc("Item Group", item_doc.item_group)
                if item_doc.supplier_items:
                    for supplier in item_doc.supplier_items:
                        frappe.delete_doc("Supplier", supplier)
                if item_doc.customer_items:
                    for customer in item_doc.customer_items:
                        frappe.delete_doc("Customer", customer)
                for uom in item_doc.uoms:
                    frappe.delete_doc("UOM", uom)
```

In the code above, the following steps are taken:

1. It checks the identifier passed has a value. In this case the identifier of the Item document is the `item_name`. If no `item_name` is passed, the code understands this as all testing Item documents shall be deleted:

```python
if not item_name:
    TestItem.destroy_all()
```

2. If `item_name` has a value, it is passed to the `frappe.db.exists` method to get the docname of the Item with the specific attribute. The Item document with that docname is pulled using the `frappe.get_doc` method and is deleted:

```python
 item = frappe.db.exists("Item", {"item_name": item_name})
if item:
    item_doc = frappe.get_doc("Item", item)
    frappe.delete_doc("Item", item)
```

3. There is an additional `destroy_prerequisites` parameter in the `destroy` method (and `destroy_all` as well), which deletes the linked documents to that current document i.e., the prerequisites of the document. These are deleted as well if the `destroy_prerequisites`'s value evaluates to `True`. The default value of the `destroy_prerequisites` parameter is `False`. It is rarely advised to delete prerequisites of a document, so **be careful when setting this to `True`**.

```python
if item:
    item_doc = frappe.get_doc("Item", item)
    frappe.delete_doc("Item", item)

    if destroy_prerequisites:
        frappe.delete_doc("Item Group", item_doc.item_group)
        if item_doc.supplier_items:
            for supplier in item_doc.supplier_items:
                frappe.delete_doc("Supplier", supplier)
        if item_doc.customer_items:
            for customer in item_doc.customer_items:
                frappe.delete_doc("Customer", customer)
        for uom in item_doc.uoms:
            frappe.delete_doc("UOM", uom)
```

### 5.1.4 destroy_all

This method deletes all Item documents in the database with `_Test` as a prefix in whatever the basis field is specified within the method (e.g., For Item documents, it is the `item_name` field).

```python
class TestItem(unittest.TestCase):
    @staticmethod
    def destroy_all():
        test_items = get_test_doc_list("tabItem", "item_name")

        for test_item in test_items:
            item_doc = frappe.get_doc("Item", test_item)
            item_doc.buying_prices = []
            item_doc.buying_discounts = []
            item_doc.buying_deals = []
            item_doc.selling_prices = []
            item_doc.selling_discounts = []
            item_doc.selling_deals = []
            item_doc.save()
            frappe.db.delete("Item Barcode", {"parent": test_item})
            frappe.db.delete("UOM Conversion Detail", {"parent": test_item})
            frappe.delete_doc("Item", test_item)

        TestItem.destroy_prerequisites()
```

In the code above, the following steps are taken:

1. It calls the `get_test_doc_list` function imported from the `erpnext.tests.utils` module, which looks like this:

```python
def get_test_doc_list(table_name, filter_column_name):
    test_doc_list = frappe.db.sql(
        """
            select name
            from `{0}`
            where {1} like '%\\_Test%'
        """.format(
            table_name, filter_column_name
        ),
        as_list=1,
    )

    return list(zip(*test_doc_list))[0] if test_doc_list else []
```

> The `get_test_doc_list` method returns all `name` values in the specified table (`table_name`) and filters the rows such that only those with `_Test` in the filter field (`filter_column_name`) are returned.

2. It loops over every docname returned by the `get_test_doc_list` function and removes all links to other documents and child table rows that have a Link field to the current DocType. The reason for this is because the system throws an error when a document is deleted but that document is linked in another existing document (e.g., when an Item document linked to an existing Item Price is deleted). In order to resolve this issue, we have to unlink them first (and/or delete the other document) before we delete the current document.

```python
for test_item in test_items:
    item_doc = frappe.get_doc("Item", test_item)
    item_doc.buying_prices = []
    item_doc.buying_discounts = []
    item_doc.buying_deals = []
    item_doc.selling_prices = []
    item_doc.selling_discounts = []
    item_doc.selling_deals = []
    item_doc.save()
    frappe.db.delete("Item Barcode", {"parent": test_item})
    frappe.db.delete("UOM Conversion Detail", {"parent": test_item})
    frappe.delete_doc("Item", test_item)

TestItem.destroy_prerequisites()
```

> **Example:** For the Item DocType, such unlinking has to be done for Item Price, Item Buying Discount, Item Selling Discount, Item Buying Deal, and Item Selling Deal, as shown in the code above.

### 5.1.5 destroy_prerequisites

This method deletes the prerequisite documents linked to the current document. It takes similar arguments as the `setup_prerequisites`, **all of which are keyword arguments** and have default values that evaluate to `False` (e.g., `None`, `[]`). It deletes the actual documents linked to the current document based on the arguments passed to identify them using their DocTypes' corresponding `destroy` methods.

A few things to note:

1. Check first if the field in the current document is required. In the Item DocType, the Item Group is required, while the Suppliers are not. Hence, the `destroy_prerequisites` method shall check first if a non-empty list for the `suppliers` parameter is passed, while the Item Group is deleted in every call.

2. Use the `destroy` method, and **not** the `destroy_all` method. This is to avoid errors in unit tests involving document deletion and linked fields.

3. Use this sparingly outside the `destroy` and `destroy_all` methods of its own class.

```python
class TestItem(unittest.TestCase):
    @staticmethod
    def destroy_prerequisites(
        item_group_name=None, suppliers=[], customers=[], uoms=[]
    ):
        TestItemGroup.destroy(item_group_name)
        for supplier in suppliers:
            TestSupplier.destroy(supplier)
        for customer in customers:
            TestCustomer.destroy(customer)
        for uom in uoms:
            TestUOM.destroy(uom)
```

## 5.2 Unit Tests

The unit testing framework that we use at BizKit is unittest. Read its official documentation [here](https://docs.python.org/3/library/unittest.html).

### 5.2.1 Red, Green, Refactor

#### 5.2.1.1 Getting Started

The red, green, refactor approach is a common technique used in test-driven development. It consists of the following steps:

1. <span style="color: red;">Red</span>: Write a failing test for a piece of functionality that you want to add to your code. The test should define the expected behavior of the code and should be written before the code itself is written.
2. <span style="color: green;">Green</span>: Write the code to make the test pass. This should be done in a way that satisfies the requirements of the test and ensures that the code works as expected. This is typically the minimum amount of code needed to make the test pass.
3. <span style="color: blue;">Refactor</span>: Once the code passes the test, you can refactor the code to improve its design, readability, and performance. This is done without changing the functionality of the code, so the tests should still pass.

The red-green-refactor approach is useful because it helps you focus on one small piece of functionality at a time, which makes the development process more manageable. It also encourages you to think about the design of your code upfront, and helps ensure that your code is well-tested.

#### 5.2.1.2 Example

Here is an example of the red, green, refactor approach in test-driven development:

1. <span style="color: red;">Red</span>: Write a test to check that a function called `add` can be used to add two numbers together and return the result. The test should define the expected behavior of the `add` function, and should be written before the `add` function itself is written.

```python
def test_add():
  result = add(2, 3)
  assert result == 5
```

2. <span style="color: green;">Green</span>: Write the `add` function to make the test pass. This should be done in a way that satisfies the requirements of the test and ensures that the `add` function works as expected.

```python
def add(a, b):
  return 5
```

3. <span style="color: blue;">Refactor</span>: Once the `add` function passes the test, you can refactor the code to make it more modular and readable. This might involve restructuring the code, adding comments, or making other improvements.

```python
def add(a, b):
  # Return the sum of a and b
  return a + b
```

In this example, the red, green, refactor approach is used to write a simple function called `add` that can be used to add two numbers together and return the result. The test is written first, and then the code is written to make the test pass. The code is then refactored to improve its readability and maintainability. After refactoring, more tests are added and/or the existing tests are updated to handle more scenarios.

### 5.2.2 Basic Rules

There are several basic rules that you should follow when writing unit tests in Frappe:

1. Each test case should be a subclass of `unittest.TestCase` and should contain one or more test methods that begin with the word `test`.
2. Test methods should use the various assertions provided by the `unittest` module to verify that the code under test is working correctly.
3. Test cases should be isolated from one another. This means that each test should run independently and not depend on any other test to be run first.
4. Test cases should be repeatable. This means that the same test should produce the same results every time it is run, regardless of the environment or other factors.
5. Test cases should be thorough. This means that they should cover all relevant scenarios and test for all possible outcomes.
6. Test cases should be easy to read and understand. This means that they should be well-structured and use clear, descriptive names for variables and methods.
7. Test code is still code. It should follow the same standards as production code (e.g., DRY, KISS principles).

### 5.2.3 Steps

To write unit tests in the Frappe framework, you can follow these steps:

1. Start by creating a new file for your tests. In Frappe, unit tests can be placed in a `tests` directory within an app or inside a doctype's directory. For example, if you are writing tests for the `frappe` app, you would create a new file called `tests/test_my_module.py` (or `my_doctype/test_my_doctype.py` if you are testing a doctype).
2. Import the `unittest` module and the app module that you want to test. For example:

```python
import unittest
from my_module import my_module_function
```

3. Next, create a new class for your tests, which will be derived from the `unittest.TestCase` class. This class will contain all of the tests for your module or doctype.

4. Within the `TestCase` subclass, you can now define individual test methods. Each test method should be named starting with `test_`, and should contain one or more assertions that test a specific behavior of the code being tested.

Here is an example of how this might look in the `test_my_module.py` file:

```python
import unittest
from my_module import my_module_function

class TestMyModule(unittest.TestCase):
    def setUp(self):
        frappe.set_user("Administrator")
        create_test_data()

    def tearDown(self):
        frappe.set_user("Administrator")
        delete_test_data()

    def test_my_module_function(self):
        # Test code goes here
        frappe.set_user("test@example.com")
        self.assertEqual(my_module_function(), "expected output")
```

The `setUp` function is used to perform any necessary setup tasks before unit tests within a `TestCase` class are run. This can include things like opening database connections, creating temporary files, or modifying global state in a way that is necessary for the test to run properly.

The `tearDown` function is used to perform any necessary clean up tasks after unit tests within a `TestCase` class are run. This can include things like closing any open database connections, cleaning up temporary files, or restoring any modified global state.

The `setUp` and `tearDown` functions are both optional, and you only need to use them if your tests require some kind of setup or cleanup. In most cases, it is a good idea to use these functions to make your tests more modular and easier to maintain.

5. Once you have written your tests, you can run them using the `bench` command-line tool from within the app's directory. This will execute all of the test cases and display the results.

```bash
bench run-tests
```

> Note: Testing is disabled by default. You can enable tests by entering following command:

```bash
bench --site site_name set-config allow_tests true
```

That's it! These are the basic steps for writing and running unit tests in the Frappe framework. Keep in mind that there are many other features and options available for unit testing in Frappe, so you may want to consult the [official Frappe documentation](https://frappeframework.com/docs/v13/user/en/guides/automated-testing/unit-testing) for more information.

### 5.2.4 Additional Reminders and Tips

A few things to remember when writing unit tests:

1. As much as possible, avoid using default document names (e.g., `_Test Item`). Create documents with names specific to the unit test to ensure that the attributes of the item are those known by the unit test. One way to do this is to use the test name when creating the document (e.g., `_Test Item test_deduct_item_discounts_from_item_amounts`).
2. Avoid deleting documents and transactions to avoid errors when deleting documents linked to other documents.
3. Start with a small, well-defined task. This will help you focus on the task at hand and avoid getting overwhelmed.
4. Write a test for the task before you write the code. This will help you understand the requirements and constraints of the task, and it will give you a clear goal to work towards.
5. Write the minimum amount of code needed to make the test pass. This will help you avoid over-engineering and keep your code simple and focused.
6. Refactor your code to improve its design and readability. This will help you make your code more maintainable and easier to understand.
7. Repeat the process for each new feature or task you want to implement. This will help you build a suite of tests that will give you confidence in the correctness and completeness of your code.
8. Be persistent and keep practicing. Test-driven development can be challenging at first, but it becomes easier and more natural with time and practice.
9. To make sure your test data doesn't mess with the real data in your ERPNext instance, run the tests on a separate test site with the necessary apps installed. (Tip: You can check the `run_tests.sh` file under the erpnext repo for the steps taken to run all BizKit-updated tests.)
10. Avoid editing the setup methods without making sure that all updated tests run correctly with your proposed change. Additionally, as much as possible, only include required fields in the parameters in the `create` methods.

# 6 Running Unit Tests

This is the _exciting_ part! (lol is it really)

Follow these steps when running unit tests in your local instance:

1. Run your unit tests individually first (using the `--test` flag).
2. Once all your unit tests have passed individually, run the whole module/DocType if possible (using the `--doctype` or `--module` flag).
3. If all tests pass as well, run all BizKit-updated tests (using the `bench run-bizkit-tests` command). Make sure that your new tests are accounted for in the `updated_doctypes.txt` and/or `updated_modules.txt` file.
4. If you encounter no errors while running all BizKit-updated tests, you're **#MarkedAsSafe**!
