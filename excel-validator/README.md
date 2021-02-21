# excel-validator for Sunbird Assessment Bulk Upload 

### Step 2 metadata validation
 Check  Question-ids are present for all rows and they are unique, else report error.
- Use read content api to fetch textbook details, BMGS and status. Report if there is any mismatch and verify book is in draft state. 
- Check the validity of QR codes using search content apis and if they are mapped to specified textbook. The mismatch or not live QR codes are reported. 
### Step 3 Image path validation
- Check the question images and option images are present on specified paths in sheet. Report missing images.
- Check the properties of images - image size to be less than 1MB, only .jpg image type allowed.
- For Icon image check if the size is 512x512.
