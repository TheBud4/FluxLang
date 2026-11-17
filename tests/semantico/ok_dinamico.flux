func soma (a:int, b:int):int { return a + b; }
func main () {
  var user:object = { age: 17, active: true, name: "x" };
  var idade:int = user.age;
  var maior = user.age + 1 > 17;
  if (user.active) { terminal.log(user.name); }
  var t:int = soma(user.age, 2);
  user.city = "Curitiba";
  var s:string = user["name"];
  var l:list<int> = [1];
  l[0] = user.age;
}
