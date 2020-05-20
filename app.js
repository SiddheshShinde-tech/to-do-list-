// jshint esversion:6

// Requiring NPM Packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connecting with MongoDB server
mongoose.connect('mongodb+srv://Siddhesh:siddheshpratap@cluster0-n4gpy.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Framing the Schema
const itemSchema={
  name: String
};
var entrySchema={
  name: String,
  items: [itemSchema]
};

//Creating a model with or a new collection
const Item=mongoose.model("Item",itemSchema);    // For default 'Today' List
const entry=mongoose.model("entry",entrySchema); // For custom to-do-list

// Creating documents
const item1=new Item({
  name: "Welcome to your todolist."
});
const item2=new Item({
  name: "Hit the + button to add a new item."
});
const item3=new Item({
  name: "<-- Hit this to delete an item."
});

const set=[item1,item2,item3];

app.get("/", function(req, res) {
  Item.find({},function(err,docs){
    if(docs.length === 0){
      Item.insertMany(set,function(err){
      if(err){
      console.log(err);}
      else{
        console.log("Successfully added default elements to the database."); 
          }
});
res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: docs});
    }  
  });
});


app.post("/", function(req, res){

  const nItem = req.body.newItem;
  const lItem = req.body.list;
  const item=new Item({
    name: nItem
  });
  if(lItem === "Today"){
    item.save();
    res.redirect("/");
  }else{
    entry.findOne({name: lItem},function(req,result){
      result.items.push(item);
      result.save();
      res.redirect("/" + lItem);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItem= req.body.checkbox;
  const listName=req.body.ename;
  if(listName === "Today")
  {
    Item.deleteOne({_id :checkedItem}, function(err)
  {
    if(err){
      console.log(err);
    }
    else{
      console.log("Deleted item successfully");
    }
    res.redirect("/");
  });
}
  else{
    entry.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItem}}},function(err,result){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get('/:name',function(req,res){
  const lname=_.capitalize(req.params.name);  //Implemented Lodash to capitalize the first letter
  entry.findOne({name: lname},function(err,result){
    if(!err){
      if(result){
        // Use existing entry

        res.render("list",{listTitle: result.name, newListItems: result.items});
      }
      else{
        // Create a new entry

        const listItem=new entry({
          name: lname,
          items: set
        });   
        listItem.save();
        res.redirect("/"+lname);
      }
  }});
});

// Listening port

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
