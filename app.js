const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const expressSanitizer=require("express-sanitizer")
const app=express();

mongoose.connect("mongodb+srv://username:password@cluster0.qjkr4.mongodb.net/newProfileDB",{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false});
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

const newprofileSchema=mongoose.Schema({
    title:String,
    image:String,
    body:String,
    location:String,
    created:{type:Date,default:Date.now}
});
const NewProfile=mongoose.model("NewProfile",newprofileSchema);
app.get("/",(req,res)=>{  
  res.redirect("/profiles");
});
////////////////////INDEX ROUTE
app.get("/profiles",(req,res)=>{
  var noMatch=null;
  // eval(require("locus")); 
  if(req.query.search){
    const regex=new RegExp(escapeRegex(req.query.search),"gi");
    // Get all profiles 
    NewProfile.find({title:regex},(err,profiles)=>{
      if(err){
          console.log(err);
      }else{
        if(profiles.length<1){
          noMatch=" NO PROFILE WITH THAT NAME EXISTS PLEASE TRY A DIIFERENT USERNAME "
        } 
         res.render("index",{profiles:profiles,noMatch:noMatch});
      }
     });
       }else{
    NewProfile.find({},(err,profiles)=>{
      if(err){
          console.log(err);
      }else{
         res.render("index",{profiles:profiles,noMatch:noMatch});
      }
     });
  }
});
/////////////////NEW ROUTE
app.get("/profiles/new",(req,res)=>{
  res.render("new");
});
/////////////////////////CREAYTE ROUTE
app.post("/profiles",(req,res)=>{
  req.body.profile.body=req.sanitize(req.body.profile.body);
//create  profile
NewProfile.create(req.body.profile,(err,newProfile)=>{
if(err){
  res.render("new");
}else{
//redirect to index
res.redirect("/profiles");
}
});
});
app.get("/profiles/:id",(req,res)=>{
NewProfile.findById(req.params.id,(err,foundProfile)=>{
if(err){
  console.log(err);
}else{
     res.render("show",{profile:foundProfile});
}
});
});
//////EDIT
app.get("/profiles/:id/edit",(req,res)=>{
  NewProfile.findById(req.params.id,(err,foundProfile)=>{
  if(err){
      res.redirect("/profiles");
  }else{
      res.render("edit",{profile:foundProfile});
  }
  });
});
/////////////////////UPDATE
app.put("/profiles/:id",(req,res)=>{
  req.body.profile.body=req.sanitize(req.body.profile.body);
 NewProfile.findByIdAndUpdate(req.params.id,req.body.profile,(err,updatedProfile)=>{
   if(err){
     res.redirect("/");
   }else{
     res.redirect("/profiles/"+req.params.id);
   }
 })
});
////////////////////////DELETE ROUTE
app.delete("/profiles/:id",(req,res)=>{
NewProfile.findByIdAndRemove(req.params.id,(err)=>{
  if(err){
    res.send(err);
  }else{
    res.redirect("/profiles");
  }
});
});
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
app.listen(process.env.PORT || 3000,()=>{
console.log("Server Started Succesfully");
});

