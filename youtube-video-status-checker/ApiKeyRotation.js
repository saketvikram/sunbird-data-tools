
 function ApiKeyRotation(operate, update_object) {
const low = require('lowdb')

//if(update_object.env === "server") {
const FileSync = require('lowdb/adapters/FileSync')
 const adapter = new FileSync('db.json')
//}
/*
if(update_object.env === "browser") {
const LocalStorage = 'lowdb/adapters/LocalStorage'
const adapter = new LocalStorage('db')
}*/
  const db = low(adapter)
 
 Date.prototype.sameDay = function(d) {
  	// console.log(d.getFullYear());
return this.getFullYear() === d.getFullYear()
    && this.getDate() === d.getDate()
    && this.getMonth() === d.getMonth();
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

// console.log(db.read().__wrapped__);

var key_rotate_db = db.read().__wrapped__;

if(operate === "initialise" && isEmptyObject(key_rotate_db)) {
  console.log('i am initializing db');
 
// Set some defaults
libraryobj = {};
libraryobj.last_log_cleared = new Date();
libraryobj[update_object.library] = {};
update_object.api_keys.forEach(function(item){
  if(!item.exhaust){item.exhaust = 0;}
})
libraryobj[update_object.library].keys = update_object.api_keys;
libraryobj[update_object.library].current_key = update_object.api_keys[0];
libraryobj[update_object.library].current_key_index = 0; 
db.defaults({
  library : libraryobj
	  })
  .write()


}

if(operate === "counter_increment"){
var current_date = new Date();
if(key_rotate_db.library) {var cmp_date_string = key_rotate_db.library.last_log_cleared;

var cmp_date = new Date(cmp_date_string);
}

 if(cmp_date === undefined) {
  console.log("inside cmp_date undefined");
 	return "not a valid operation on undefined db set";
 } else {
/*if(!current_date.sameDay(cmp_date)) {

 
} else { */
// console.log("writing oobects");
if(key_rotate_db.library) {var cmp_date_string = key_rotate_db.library.last_log_cleared;

var cmp_date = new Date(cmp_date_string);}

// console.log("this is compare date"+ cmp_date);

if(!current_date.sameDay(cmp_date)) {
  // console.log("going to update library after day pass");
  for (var key in key_rotate_db.library) {
    if (key === "last_log_cleared") {
      key_rotate_db.library[key] = new Date();
    }
    if (key_rotate_db.library.hasOwnProperty(key) && key !== "last_log_cleared") {
      // console.log('this is key i am looking for : ', key_rotate_db.library[key]);
        key_rotate_db.library[key].current_key_index = 0;
        key_rotate_db.library[key].current_key = key_rotate_db.library[key].keys[0];
        key_rotate_db.library[key].keys.forEach(function(item){
       item.exhaust = 0;
})
        // console.log("before updating the library object");
var update_each_lib = "library." + key;
   db.set(update_each_lib, key_rotate_db.library[key])
  .write()
    }
}



 }
 var key_rotate_db = db.read().__wrapped__;
 if(key_rotate_db.library[update_object].current_key.exhaust >= key_rotate_db.library[update_object].current_key.limit){
  var lib_count = key_rotate_db.library[update_object].current_key_index + 1;
  var key_index = key_rotate_db.library[update_object].keys.length;
  if (lib_count > key_index){
    console.log("keys exhausted");
    return 0;
  }
  // Update keys array with exhausted limit:
  var current_keys_exhaust_update = key_rotate_db.library[update_object].keys;
current_keys_exhaust_update[lib_count-1] = key_rotate_db.library[update_object].current_key;

var lib_key_update = "library."+ update_object + ".keys";
  db.set(lib_key_update, current_keys_exhaust_update)
  .write()
// Update Current Key index
 var curr_key_index_update = "library."+ update_object + ".current_key_index";
  db.set(curr_key_index_update, lib_count)
  .write()
// Update Current Key
  var current_key = key_rotate_db.library[update_object].keys[lib_count];
   var curr_key_update = "library."+ update_object + ".current_key";
   db.set(curr_key_update, current_key)
  .write()
 }
  var count = key_rotate_db.library[update_object].current_key.exhaust + 1;
  console.log("this is object count", count);
  var key_to_be_set = key_rotate_db.library[update_object].current_key.exhaust;
  console.log(key_to_be_set);
  var lib_update = "library."+ update_object + ".current_key.exhaust";
  db.set(lib_update, count)
  .write()



// }
 	
 }


}

}



module.exports = ApiKeyRotation;
