function submitForm(oFormElement)
{
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
        var myResponse = JSON.parse(xhr.responseText);
        document.getElementById('status').innerHTML=myResponse['status'];
        if(myResponse['scores']!= null && myResponse['nodes']!=null ){
          populateGraph(myResponse['scores'], myResponse['nodes']);
        }
    }
  }
  xhr.open (oFormElement.method, oFormElement.action, true);
  xhr.send (new FormData (oFormElement));
  return false;
}
//Muestra el formulario requerido
function showForm(formShown){

  els = document.getElementsByClassName('formclass');
  Array.prototype.forEach.call(els, function(el) {
     el.style.display = "none";
  });

  document.getElementById(formShown).style.display="block";
  return false;
}

