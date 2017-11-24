# where are my tweets?  

This code was written for the Masters Develpment Project at the University Of Glasgow.

### Dependencies
The script for crawling developed have dependencies to:  

 - `argparse`
 - `jquery`
 - `moment`
 - `nightmare`
 - `node-schedule`
 - `slug`
 
 The crawling module is located in the folder `JsCrawler` while the processing side is found in `PyProcessor`, however, the latter is not documented as it should be as is rather simple.
 
### Calling the crawler

```  
usage: crawl.js [-h] [-v] -s SEARCH_TERM [-l LANGUAGE] [-from FROM] -to TO
                [-o OUTPUT_FOLDER]

Required arguments:
  -s SEARCH_TERM, --search_term SEARCH_TERM
                        The search term
  -to TO, --to TO       Date from in yyyy-MM-dd format

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -l LANGUAGE, --language LANGUAGE
                        The language to run the search on
  -from FROM, --from FROM
                        Date to in yyyy-MM-dd format
  -o OUTPUT_FOLDER, --output_folder OUTPUT_FOLDER
                        Date from in yyyy-MM-dd format  
```
