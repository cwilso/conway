var IE = false;
if(navigator.appName=='Microsoft Internet Explorer')
	var IE=true;
var Jazz;
var active_element;
var current_in;
var msg;
var selectedIn;
var selectedOut;
var lastNote = -1;

function midiProc(t,a,b,c) {
  var cmd = a >> 4;
  var channel = a & 0xf;

  var noteNumber = b;

  if ( cmd==8 || ((cmd==9)&&(c==0)) ) { // with MIDI, note on with velocity zero is the same as note off
    // note off
    //noteOff(b);
  } else if (cmd == 9) {  // Note on
    if ((noteNumber&0x0f)==8)
      tick();
    else {
      var x = noteNumber & 0x0f;
      var y = (noteNumber & 0xf0) >> 4;
      flipXY( x, y );
    }
  } else if (cmd == 11) { // Continuous Controller message
    switch (b) {
    }
  }
}

//// Listbox
function changeMidiIn(){
 try{
  if(selectedIn.selectedIndex){
   current_in=Jazz.MidiInOpen(selectedIn.options[selectedIn.selectedIndex].value,midiProc);
  } else {
   Jazz.MidiInClose(); current_in='';
  }
  for(var i=0;i<selectedIn.length;i++){
   if(selectedIn[i].value==current_in) selectedIn[i].selected=1;
  }
 }
 catch(err){}
}

function changeMidiOut(){
  if(selectedOut.selectedIndex)
   Jazz.MidiOutOpen(selectedOut.options[selectedOut.selectedIndex].value);
}

//// Connect/disconnect
function connectMidiIn(){
 try{
  var str=Jazz.MidiInOpen(current_in,midiProc);
  for(var i=0;i<sel.length;i++){
   if(sel[i].value==str) sel[i].selected=1;
  }
 }
 catch(err){}
}

function disconnectMidiIn(){
 try{
  Jazz.MidiInClose(); sel[0].selected=1;
 }
 catch(err){}
}

function onFocusIE(){
 active_element=document.activeElement;
 connectMidiIn();
}
function onBlurIE(){
 if(active_element!=document.activeElement){ active_element=document.activeElement; return;}
 disconnectMidiIn();
}

//init: create plugin
window.addEventListener('load', function() {
  Jazz = document.createElement("object");
  Jazz.style.position="absolute";
  Jazz.style.visibility="hidden";

  if (IE) {
    Jazz.classid = "CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90";
  } else {
    Jazz.type="audio/x-jazz";
  }

  var fallback = document.createElement("a");
  fallback.style.visibility="visible";
  fallback.style.background="white";
  fallback.style.font="20px Arial,sans-serif";
  fallback.style.padding="20px";
  fallback.style.position="relative";
  fallback.style.top="20px";
  fallback.style.zIndex="100";
  fallback.style.border="2px solid red";
  fallback.style.borderRadius="5px";
  fallback.appendChild(document.createTextNode("This page requires the Jazz MIDI Plugin."));
  fallback.href = "http://jazz-soft.net/";
  Jazz.appendChild(fallback);

  document.body.insertBefore(Jazz,document.body.firstChild);

  selectedIn=document.getElementById("midiIn");
  selectedOut=document.getElementById("midiOut");
  try{
    current_in=Jazz.MidiInOpen(0,midiProc);
    var list=Jazz.MidiInList();
    for(var i in list){
      selectedIn[selectedIn.options.length]=new Option(list[i],list[i],list[i]==current_in,list[i]==current_in);
    }

    list=Jazz.MidiOutList();
    for(var i in list)
      selectedOut[i]=new Option(list[i],list[i],i==0,i==0);

    // Find the interface named the same as the input (e.g. "Numark DJ2Go")
    var interfaceName = selectedIn.options[selectedIn.selectedIndex].value;
    for (var i=0; i<selectedOut.options.length; i++) {
      if (selectedOut.options[i].value == interfaceName ) {
        selectedOut.selectedIndex = i;
        Jazz.MidiOutOpen(interfaceName);
      }
    }

  }
  catch(err){}

  if(navigator.appName=='Microsoft Internet Explorer'){ document.onfocusin=onFocusIE; document.onfocusout=onBlurIE;}
  else{ window.onfocus=connectMidiIn; window.onblur=disconnectMidiIn;}

  Jazz.MidiOut( 0xB0,0x00,0x00 ); // Reset Launchpad
  Jazz.MidiOut( 0xB0,0x00,0x01 ); // Select XY mode
//  Jazz.MidiOut( 0xB0,0x00,0x7f ); // Test




});