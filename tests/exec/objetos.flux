func main () {
  var user:object = { name: "Ana", age: 17, "x-y": true };
  terminal.log(user.name);
  terminal.log(user["x-y"]);
  terminal.log(user.phone);
  user.phone = "99";
  user["city"] = "Curitiba";
  terminal.log(user);
  var idade:int = user.age;
  terminal.log(idade + user.age);
  if (user.phone == null) { terminal.log("sem"); } else { terminal.log("tem"); }
  var outro = user;
  outro.name = "Bia";
  terminal.log(user.name);
}
