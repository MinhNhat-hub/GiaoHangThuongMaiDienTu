# Software Requirements Specification

# for

# PearlsFromSand.com

# Version 1.1 approved

# Prepared by Karl Wiegers

# August 22, 2013

**Table of Contents**

[**1. Introduction 2**](#1-introduction)

[1.1 Purpose 2](#11-purpose)

[1.2 Document Conventions 2](#12-document-conventions)

[1.3 Project Vision and Product Scope 2](#13-project-vision-and-product-scope)

[1.3.1 Vision Statement 2](#131-vision-statement)

[1.3.2 Product Scope 2](#132-product-scope)

[1.4 References 2](#14-references)

[**2. Overall Description 2**](#2-overall-description)

[2.1 User Classes and Their Use Cases 2](#21-user-classes-and-their-use-cases)

[2.1.1 Visitor 2](#211-visitor)

[2.1.2 Customer 2](#212-customer)

[2.1.3 Submitter 2](#213-submitter)

[2.1.4 Administrator 2](#214-administrator)

[2.2 Operating Environment 2](#22-operating-environment)

[2.3 Design and Implementation Constraints 2](#23-design-and-implementation-constraints)

[2.4 User Documentation 2](#24-user-documentation)

[2.5 Assumptions and Dependencies 2](#25-assumptions-and-dependencies)

[**3. Functional Requirements 2**](#3-functional-requirements)

[3.1 Use Cases for Visitors 2](#31-use-cases-for-visitors)

[UC-V-1: Get Information about *Pearls from Sand* 2](#uc-v-1-get-information-about-pearls-from-sand)

[UC-V-2: Get Information about the Author 2](#uc-v-2-get-information-about-the-author)

[UC-V-3: Read the Blog 2](#uc-v-3-read-the-blog)

[UC-V-4: Contact the Author 2](#uc-v-4-contact-the-author)

[UC-V-5: Purchase Other Books 2](#uc-v-5-purchase-other-books)

[3.2 Use Cases for Customers 2](#32-use-cases-for-customers)

[UC-C-1: Order a Product 2](#uc-c-1-order-a-product)

[UC-C-2: Download an Electronic Product 2](#uc-c-2-download-an-electronic-product)

[UC-C-3: Request Assistance with a Problem 2](#uc-c-3-request-assistance-with-a-problem)

[3.3 Use Cases for Submitters 2](#33-use-cases-for-submitters)

[UC-S-1: Submit a Pearl 2](#uc-s-1-submit-a-pearl)

[UC-S-2: Withdraw or Modify a Pearl 2](#uc-s-2-withdraw-or-modify-a-pearl)

[3.4 Use Cases for Administrators 2](#34-use-cases-for-administrators)

[UC-A-1: Modify Site Contents 2](#uc-a-1-modify-site-contents)

[UC-A-2: Manage Blog Entries 2](#uc-a-2-manage-blog-entries)

[UC-A-3: Manage Product List 2](#uc-a-3-manage-product-list)

[UC-A-4: Issue a Refund to a Customer 2](#uc-a-4-issue-a-refund-to-a-customer)

[UC-A-5: Contact a Submitter about a Pearl 2](#uc-a-5-contact-a-submitter-about-a-pearl)

[UC-A-6: Manage E-mail List 2](#uc-a-6-manage-e-mail-list)

[**4. External Interface Requirements 2**](#4-external-interface-requirements)

[4.1 User Interfaces 2](#41-user-interfaces)

[4.2 Software Interfaces 2](#42-software-interfaces)

[4.3 Communications Interfaces 2](#43-communications-interfaces)

[**5. Other Nonfunctional Requirements 2**](#5-other-nonfunctional-requirements)

[5.1 Performance Requirements 2](#51-performance-requirements)

[5.2 Security 2](#52-security)

[5.3 Extensibility 2](#53-extensibility)

[**6. Business Rules 2**](#6-business-rules)

[**Appendix A: Analysis Models 2**](#_toc288757489)

[**Appendix B: Issues List 2**](#_toc288757490)

[**Revision History 2**](#_toc288757491)

# 1. Introduction

## 1.1 Purpose

This document describes the requirements for the PearlsFromSand.com website, which provides supporting information for and helps with marketing of the book *Pearls from Sand: How Small Encounters Lead to Powerful Lessons* by Karl Wiegers.

## 1.2 Document Conventions

The functional requirements for this project are organized by use case within user class.

## 1.3 Project Vision and Product Scope

### 1.3.1 Vision Statement

For people who are interested in the book *Pearls from Sand*, PearlsFromSand.com is a website that will provide information about the book and its author, allow site visitors to buy copies of the book in various formats, and will facilitate building a community of people interested in documenting and sharing their life lessons. Unlike websites that merely describe a book, PearlsFromSand.com will provide mechanisms that allow visitors to contribute their own life lessons and to read and comment on life lessons posted by others.

### 1.3.2 Product Scope

PearlsFromSand.com is a standalone website that provides all available information about the book *Pearls from Sand*. It will provide external links to other sites that sell the book or provide fulfillment of product orders placed on PearlsFromSand.com, provide additional information about the author (karlwiegers.com), and provide information about and purchasing links for other related books.

## 1.4 References

Existing web sites used as models for ideas regarding the functionality documented here include:

www.waitingforjack.com

www.ahappyyou.com

www.thepracticalguidetoexceptionalliving.com

www.mymomentsofbeing.com

www.chickensoup.com

# 2. Overall Description

## 2.1 User Classes and Their Use Cases

### 2.1.1 Visitor

A Visitor is someone who comes to the PearlsFromSand.com website to learn more about the book *Pearls from Sand* or its author, to buy a book or other product on the site, or to read or contribute to the blog associated with the book. Use cases:

UC-V-1: Get Information about *Pearls from Sand*

UC-V-2: Get Information about the Author

UC-V-3: Read the Blog

UC-V-4: Contact the Author

UC-V-5: Purchase Other Books

### 2.1.2 Customer

A Customer is someone who orders a product from the PearlsFromSand.com website. Use cases:

UC-C-1: Order a Product

UC-C-2: Download an Electronic Product

UC-C-3: Request Assistance with a Problem

### 2.1.3 Submitter

A Submitter is someone who submits a “pearl of wisdom” to the website for possible inclusion in the website’s blog or future publications. Use cases:

UC-S-1: Submit a Pearl

UC-S-2: Withdraw or Modify a Pearl

### 2.1.4 Administrator

An Administrator is responsible for setting up, updating, and modifying the PearlsFromSand.com website. Use cases:

UC-A-1: Modify Site Contents

UC-A-2: Manage Blog Entries

UC-A-3: Manage Product List

UC-A-4: Issue a Refund to a Customer

UC-A-5: Contact a Submitter about a Pearl

UC-A-6: Manage E-mail List

## 2.2 Operating Environment

PearlsFromSand.com shall be compatible with standard web browsers on Windows, Mac, and Web-enabled smart phone platforms. Supported browsers are Internet Explorer 5, 6, 7, and 8; Firefox 2 and 3; Opera 10 and 11; Google Chrome 10 and later.

## 2.3 Design and Implementation Constraints

CO-1: The Administrator shall be able to maintain and modify the site without requiring any specialized technical knowledge beyond basic HTML or the use of site editing tools provided by a commercial web site builder, such as WordPress.

CO-2: Commercially available tools and resources shall be used rather than using custom-written code for the website’s blog, e-mail management, and store..

## 2.4 User Documentation

The developer shall provide necessary documentation to enable an Administrator to perform the use cases listed in section 2.1.4 Administrator.

## 2.5 Assumptions and Dependencies

There are no known assumptions or dependencies for this website.

# 3. Functional Requirements

## 3.1 Use Cases for Visitors

### UC-V-1: Get Information about *Pearls from Sand*

Description: A Visitor shall be able to get information about the *Pearls from Sand* book from the website.

|  |  |  |
| --- | --- | --- |
| book.info: | The home page of the website shall contain a link that goes to a page that provides detailed information about *Pearls from Sand*. This information shall consist of a description and the table of contents. | (Priority=H) |
| book.sample.invite: | The display of detailed information about the book shall contain a link that invites the Visitor to download sample materials from the book. If a Visitor clicks on this link, then see book.sample.notify | (Priority=H) |
| book.sample.notify: | The website shall provide the Visitor entered with the URL to a PDF file that contains the introduction and three sample chapters of the book, as well as bonus chapters, along with links to MP3 audio files of the introduction and sample chapters. | (Priority=H) |
| book.register: | A Visitor shall be able to register his name and e-mail address on the website. Visitors who are on the e-mail list are called registered Visitors. After registering, the website shall add the Visitor’s name and e-mail address to the website’s e-mail list. | (Priority=M) |
| book.register.dupe: | If a Visitor requests to register but that name and e-mail address are already on the website’s e-mail list, the website shall not register the Visitor again. | (Priority=M) |
| book.register.privacy: | The website shall display a message stating that a Visitor’s contact information will not be used for any purpose other than contacting them with regard to *Pearls from Sand.* (depends on book.register) | (Priority=M) |
| book.unregister: | A Visitor shall be able to request that he be removed from the website’s e-mail list. (depends on book.register) | (Priority=M) |
| book.unregister.confirm: | The website shall display a confirmation message after removing a Visitor from the e-mail list. (depends on book.unregister) | (Priority=M) |
| book.purchase: | The website shall display the logos of companies that sell copies of *Pearls from Sand*. Each logo shall have a hyperlink to the page at that company’s website for the book. | (Priority=H) |
| book.video: | The website shall have a video player embedded that will play a video of approximately 120 seconds duration of the author describing *Pearls from Sand*. The Visitor shall be able to initiate and control the playing of this video (that is, the video will not launch automatically when the page is displayed). | (Priority=M) |
| book.endorsements: | The website shall have a page that lists endorsements and favorable reviews of the book. | (Priority=L) |

### UC-V-2: Get Information about the Author

Description: A Visitor shall be able to get information about the author of *Pearls from Sand* from the website.

|  |  |  |
| --- | --- | --- |
| author.info: | The home page shall provide a link to a page with biographical information about the author. | (Priority=H) |
| author.contact: | The page with author information shall contain a link to the author contact form (see UC-V-4). | (Priority=H) |
| author.moreinfo: | The biographical page shall provide a link to karlwiegers.com with a prompt to follow that link for more information about the author. | (Priority=H) |

### UC-V-3: Read the Blog

Description: A Visitor shall be able to view and contribute to blog entries on the website.

|  |  |  |
| --- | --- | --- |
| blog.link: | The home page shall provide a link to the website’s blog.<br>*Constraint:* The blog on the web site shall use a commercially available blogging tool (such as WordPress or Google’s Blogger), not a custom solution. | (Priority=H) |
| blog.read.current: | A Visitor shall be able to read any current blog entry. | (Priority=H) |
| blog.read.archive: | A Visitor shall be able to read any blog entry that has been archived and is still available on the website. | (Priority=H) |
| blog.comment: | A Visitor shall be able to post a comment on any blog entry. If the blogging tool used permits, a Visitor shall be able to edit comments he has entered. | (Priority=H) |

### UC-V-4: Contact the Author

Description: A Visitor shall be able to send an e-mail message to the author from the website.

|  |  |  |
| --- | --- | --- |
| contact.form: | The website shall use an e-mail form that does not make the destination e-mail address visible on the screen or in the HTML code. | (Priority=H) |
| contact.contents: | An e-mail that a Visitor sends shall be composed of the following fields:<br>1. Visitor’s name (optional)<br>2. Visitor’s e-mail address (required)<br>3. Message text of arbitrary length (required) | (Priority=H) |
| contact.valid.e-mail: | The website shall display an error message if the e-mail address that the Visitor enters is missing or not properly formatted. A valid e-mail address contains only letters and numbers, must contain exactly one “@” following one or more characters, must contain exactly one period following the “@” with any number of intervening characters, and must have at least one character following the period. | (Priority=H) |
| contact.valid.message: | The website shall display an error message if the message text field is empty. | (Priority=H) |
| contact.human: | The website shall use a scheme such as Captcha to ensure that a human being or other sentient creature is providing the e-mail information. | (Priority=L) |
| contact.send: | The website shall send the contents of the form via e-mail to the PearlsFromSand.com Administrator’s e-mail address and to the e-mail address the Visitor provided in the e-mail form.<br>*Constraint:* The sending process shall not require the Visitor to interact directly with his e-mail client. | (Priority=H) |
| contact.acknowledge: | When the e-mail has been successfully sent, the website shall display an acknowledgment to the Submitter. If an error occurred while attempting to send the e-mail, the website shall display an explanatory message. | (Priority=H) |

### UC-V-5: Purchase Other Books

|  |  |  |
| --- | --- | --- |
| otherbooks.list: | The website shall provide a page that lists other recommended books, displaying the cover image and a brief description of each book. | (Priority=L) |
| otherbooks.amazon: | The book cover images on the list of other books shall be hyperlinks into Amazon.com in the following format to generate referral fees for Process Impact as an Amazon Associate: http://www.amazon.com/exec/obidos/ASIN/\[ISBN10]/processimpact | (Priority=L) |

## 3.2 Use Cases for Customers

### UC-C-1: Order a Product

Description: A Customer shall be able to order one or more copies of each of one or more products from the website.

|  |  |  |
| --- | --- | --- |
| product.cart: | The website shall use a shopping cart-based on-line store mechanism that permits a Customer to add items to the cart, remove items from the cart, clear the cart, recalculate the total price of the items in the cart, continue shopping, and check out.<br>*Constraint:* The store mechanism shall only accept payments made by PayPal. | (Priority=H) |
| product.discount: | The shopping cart mechanism shall provide a discount code field that provides a specific discount percentage or a fixed dollar discount amount on specific items in the cart. Allowable discount percentages shall range from 10% to 100%. | (Priority=H) |
| product.discount.error: | If a Customer enters an invalid discount code, the website shall display an error message. A code may be invalid because the code is not known by the website, it has expired, or it does not apply to any of the products currently in the shopping cart. | (Priority=H) |
| product.shipping: | The shopping cart shall add a shipping charge (TBD) if a Customer orders a physical product that must be mailed. | (Priority=H) |
| product.signed: | The on-line store shall provide a link to www.signedbytheauthor.com, which is used if the Customer purchases a book to be signed by the author. | (Priority=H) |
| product.security: | The on-line store shall use security mechanisms to protect the integrity of transactions from unauthorized access to private information. This private information is the Customer’s name, address, telephone number, e-mail address, credit card information, and PayPal account ID and password. | (Priority=H) |

### UC-C-2: Download an Electronic Product

Description: The website shall enable a Customer to download electronic products that he purchases.

|  |  |  |
| --- | --- | --- |
| product.download.notify: | If a Customer orders an audio book or eBook, then following payment the website shall provide the Customer with instructions for downloading and using the purchased file in the format ordered (audio book: MP3 or Apple AudioBook; PDF or other specified format e-Book). | (Priority=H) |
| product.download.tries: | The Customer shall have 5 attempts to download a purchased product that is delivered electronically. | (Priority=H) |

### UC-C-3: Request Assistance with a Problem

Description: A Customer may need to report a problem with the web site, report a problem with an attempt to purchase a product, or request a refund for a purchased product. These functions are out of scope for the website. The Customer is expected to request assistance through other channels, such as sending an e-mail to the author or using the Contact the Author form (see UC-V-4: Contact the Author).

## 3.3 Use Cases for Submitters

### UC-S-1: Submit a Pearl

Description: A Submitter shall be able to submit a pearl of wisdom from the website. For a model, see http://www.chickensoup.com/form.asp?cid=submit_story.

|  |  |  |
| --- | --- | --- |
| pearl.submit: | The website shall provide a form that allows any Submitter to submit a pearl. Each pearl submission shall be composed of the following fields:<br>1. Submitter’s name (required)<br>2. Submitter’s street address (one line required, additional lines optional)<br>3. Submitter’s state or province (required; select from a list of all U.S. states and territories and Canadian provinces, or “Other”)<br>4. Submitter’s ZIP or postal code (required)<br>5. Submitter’s country (required)<br>6. Submitter’s e-mail address (required)<br>7. Submitter’s telephone number (optional)<br>8. Statement of the pearl of wisdom (required; 30 words maximum)<br>9. Category of the pearl (optional; select from Interpersonal, Personal, Inspirational, Practical, Cautionary, Professional, Other)<br>10. Description of the pearl category (required only if the Submitter selected “Other” for the Category)<br>11. Content of the pearl of wisdom (required; 250 words minimum, 1500 words maximum)<br>12. Whether or not the Submitter’s full name may be used when crediting the pearl upon publication. | (Priority=H) |
| pearl.required_field: | The pearl submission form shall visually indicate which fields are required. | (Priority=H) |
| pearl.guidelines: | The website shall provide a page where Submitters can read the guidelines for submitting a pearl. For a model, see http://www.chickensoup.com/cs.asp?cid=guidelines. | (Priority=H) |
| pearl.privacy: | The website shall display a message indicating that personal information will be treated as confidential, will not be shared with any other organization, and will be used only to communicate with the Submitter regarding submitted pearls. | (Priority=H) |
| pearl.valid.info: | If any of the required fields in the Pearl submission are missing, the website shall display specific error messages that identify all of the missing inputs. | (Priority=H) |
| pearl.word_count | For fields that have minimum and/or maximum required words lengths, the website shall display messages that show how many more words are required, how many more words are permitted, or how many words must be removed to create acceptable field entries. | (Priority=H) |
| pearl.valid.e-mail: | The website shall display an error message if the e-mail address that the Submitter enters is not properly formatted; see contact.valid.e-mail. | (Priority=H) |
| pearl.agree: | A Submitter shall be able to submit a pearl only if he has checked a checkbox on the pearl submission form that indicates the Submitter has read and agrees to the submission terms. | (Priority=H) |
| pearl.release: | From the pearl submission form a Submitter shall be able to view a page with the release disclosure information. When the Submitter returns from this page to the pearl submission form, the website shall retain any information he had previously entered in the form. | (Priority=H) |
| pearl.human: | The website shall use a scheme such as Captcha to validate that a human being or other sentient creature is submitting the pearl. | (Priority=L) |
| pearl.ID: | The website shall assign a unique, integer, sequential tracking number, beginning with 1 to each properly formatted pearl submission. | (Priority=M) |
| pearl.send: | The website shall send the contents of submitted pearls (see pearl.submit) via e-mail to the PearlsFromSand.com Administrator’s e-mail address and to the e-mail address provided in the pearl submission form. This e-mail shall include the assigned pearl tracking number.<br>*Constraint:* The sending process shall not require the Submitter to interact directly with his e-mail client. | (Priority=H) |
| pearl.acknowledge: | When a pearl has been successfully submitted, the website shall display an acknowledgment to the Submitter. If an error was encountered during submission, the website shall display an explanatory message. | (Priority=H) |

### UC-S-2: Withdraw or Modify a Pearl

Description: A Submitter shall be able to withdraw a pearl of wisdom that he previously submitted.

|  |  |  |
| --- | --- | --- |
| pearl.withdraw: | The website shall provide a link on the pearl submission description page to allow a Submitter to request that a pearl of wisdom he previously submitted be withdrawn. | (Priority=M) |
| pearl.modify: | The website shall provide a link on the pearl submission description page to allow a Submitter to make modifications in a pearl of wisdom he previously submitted. | (Priority=M) |
| pearl.invalid_ID: | If a Submitter enters an invalid pearl tracking number in a withdrawal or modification request, the website shall display an error message (dependent upon EX-1). | (Priority=L) |
| pearl.list: | A Submitter shall be able to view a list of all of the pearls he has submitted. This list shall display the tracking number, date submitted, and statement of the pearl of wisdom (dependent upon EX-1). | (Priority=L) |

## 3.4 Use Cases for Administrators

### UC-A-1: Modify Site Contents

Description: An Administrator shall be able to modify the contents of any page on the website.

|  |  |  |
| --- | --- | --- |
| page.modify: | An Administrator shall be able to modify the contents of any page on the website using an HTML editor or site editing tools provided by a commercial web site builder. | (Priority=H) |
| page.upload: | An Administrator shall be able to upload new HTML pages and image files directly to PearlsFromSand.com from his development PC without having to go through tools provided by a commercial web-site builder such as WordPress. | (Priority=H) |

### UC-A-2: Manage Blog Entries

Description: An Administrator shall be able to create new blog entries, modify existing blog entries, delete blog entries or comments to blog entries, and archive a set of blog entries.

|  |  |  |
| --- | --- | --- |
| blog.create: | An Administrator shall be able to create blog entries. | (Priority=H) |
| blog.initial: | Before the web site goes live, the Administrator shall create at least one blog entry. | (Priority=H) |
| blog.modify: | An Administrator shall be able to modify an existing blog entry. | (Priority=H) |
| blog.delete: | An Administrator shall be able to delete an existing blog entry. | (Priority=H) |
| blog.reply: | An Administrator shall be able to post a reply to any comment entered on a blog entry. | (Priority=H) |
| blog.archive: | An Administrator shall be able to archive a set of blog entries, such as all the blog entries for a given month, and make that archive available on the website. | (Priority=H) |

### UC-A-3: Manage Product List

Description: An Administrator shall be able to create new products for the on-line store and modify or delete existing products.

|  |  |  |
| --- | --- | --- |
| product.create: | An Administrator shall be able to create a new product for the on-line store. Attributes of a product are a product name, description, image, and price. | (Priority=H) |
| product.modify: | An Administrator shall be able to modify any of the attributes of an existing product in the on-line store through editing either in a text editor or an editing tool that supports the store mechanism. | (Priority=H) |
| product.discount: | An Administrator shall be able to initiate, modify, and deactivate discount codes that provide specific percentage or dollar discounts from list price for specified products. | (Priority=H) |

### UC-A-4: Issue a Refund to a Customer

Description: An Administrator shall be able to issue a refund through PayPal or through issuance of a check or store credit to a Customer who has requested one because of dissatisfaction with a product purchase. This function is out of scope for the website, as it will be handled manually or through PayPal or another mechanism.

### UC-A-5: Contact a Submitter about a Pearl

Description:  An Administrator shall be able to contact pearl Submitters under various circumstances, using the contact information the Submitter supplied. Circumstances requiring contact are: a submitted pearl is published in the blog, published in a future book, or otherwise used; to confirm the withdrawal of a submitted pearl for which a withdrawal request was received. This function is out of scope for the website, as it will be handled manually because the number of such communications is likely to be small. Should the number or frequency of such communications increase significantly, this feature may be added to the website.

### UC-A-6: Manage E-mail List

Description: An Administrator shall be able to manage a list of E-mail addresses to be used to communicate with Visitors, Customers, and Submitters.

|  |  |  |
| --- | --- | --- |
| e-mail.send: | An Administrator shall be able to send an e-mail to all entries in the website’s e-mail list or to any subset of entries in the e-mail list. | (Priority=M) |
| e-mail.add: | An Administrator shall be able to add new entries to the e-mail list. | (Priority=M) |
| e-mail.delete | An Administrator shall be able to delete specific entries from the e-mail list. | (Priority=M) |

# 4. External Interface Requirements

## 4.1 User Interfaces

UI-1: The fields used in all forms shall be wide enough to accommodate 95% of expected entries without requiring either horizontal or vertical scrolling, except for fields whose input exceeds 10 words, where vertical scroll bars shall become enabled if the user enters enough information to force a line break.

UI-2: For fields of known maximum length, such as the 10 characters of postal code (ZIP+4, plus hyphen), the fields shall not be wider than necessary to contain the expected entries.

UI-3: Each page in the website shall have a menu bar with links to the major pages (major pages being defined as the home page and those other pages directly accessible from the home page). The menu options shall change font color, style, and/or size when the user hovers his mouse pointer over them. If the currently displayed page appears in the menu bar, its link shall be shown in a different font color than the other menu options.

UI-4: Each page in the web site shall display the following copyright notice at the bottom: Copyright © 2011 Karl Wiegers. All rights reserved.

UI-5: Each page in the web site shall display one of the pearls of wisdom selected from the *Pearls from Sand* book near the bottom of the page.

UI-6: Scripts that are executed when the user submits a form shall display an animated image to indicate that the request is being processed.

UI-7: When processing of a script is completed, the web page shall display either a message confirming that the form information was submitted correctly or a descriptive error message if an error occurred during script processing.

## 4.2 Software Interfaces

External links will exist from PearlsFromSand.com to the following sites:

4.2.1 amazon.com

4.2.3 karlwiegers.com

4.2.4 signedbytheauthor.com

4.2.5 publishing.morgan-james.com

4.2.6 barrnesandnoble.com, borders.com, and other major websites that sell the book

4.2.7 processimpact.com

Links are expected to come into PearlsFromSand.com from the following sites:

4.2.7 facebook.com

4.2.8 karlwiegers.com

4.2.9 linkedin.com

4.2.10 processimpact.com

4.2.11 projectinitiation.com

## 4.3 Communications Interfaces

There are no specific communications interfaces besides URL links.

# 5. Other Nonfunctional Requirements

## 5.1 Performance Requirements

PE-1: The web pages shall fully paint in an average response time of 3 seconds or less over a broadband (DSL or cable) Internet connection.

## 5.2 Security

SE-1: The website shall use standard Web security protocols when transferring any private information regarding a Visitor, Customer, or Submitter.

SE-2: Purchased PDF files that the customer will download shall be stamped with the customer’s name, date of purchase, and a unique transaction code to reduce the likelihood of illegal sharing and posting of the downloaded files.

## 5.3 Extensibility

EX-1: The website shall be designed to permit adding a database component in the future in which to store submitted Pearls should the volume of submissions become sufficiently great to justify the use of a database. See UC-S-1, Submit a Pearl.

# 6. Business Rules

BR-1: A pearl of wisdom posted on the blog or otherwise republished may only be credited to the Submitter’s full name if the Submitter indicated that that was permissible at the time he submitted the pearl.

<a id="_toc288757489"></a>**Appendix A: Analysis Models**

Embedded object: Visio.Drawing.11

<a id="_toc288757490"></a>**Appendix B: Issues List**

1. 

<a id="_toc288757491"></a>**Revision History**

| **Name** | **Date** | **Reason For Changes** | **Version** |
| --- | --- | --- | --- |
| Karl Wiegers | 2/18/11 | 1. initial baselined version | 1.0 approved |
| Karl Wiegers | 3/24/11 | 1. Changed priorities of reqs relating to registering for e-mail list to medium | 1.1 approved |
