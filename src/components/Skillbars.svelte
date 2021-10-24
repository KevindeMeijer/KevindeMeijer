<div class="skills">
  <ul>
    <li><h3><span class="bar"><span class="html"><p class="move">HTML</p></span></span></h3></li>        
    <li><h3><span class="bar"><span class="css"><p class="move">(S)CSS</p></span></span></h3></li>        
    <li><h3><span class="bar"><span class="js"><p class="move">JS</p></span></span></h3></li>        
    <li><h3><span class="bar"><span class="react"><p class="move">ReactJS</p></span></span></h3></li>        
    <li><h3><span class="bar"><span class="svelte"><p class="move">Svelte</p></span></span></h3></li>        
    <li><h3><span class="bar"><span class="vue"><p class="move">Vue</p></span></span></h3></li>             
  </ul>
</div>

<style>
.skills {
  width: 100%;
  color: var(--white);
}

.skills li {
  margin: 20px 0;
}
.move {
  margin-left: 12px;
  font-size: 14px;
  font-family: var(--title);
}

.bar {
  background: var(--white);
  display: block;
  height: 24px;
  border: 1px solid var(--black);
  overflow: hidden;
}

.bar span {
  height: 24px;
  float: left;
  background: var(--blue_gradient_flip);
}

.html {
  width: 99%;
  animation: 1.50s ease-in-out bar;
}

.css {
  width: 98%;
  animation: 1.5s ease-in-out bar;
}

.js {
  width: 80%;
  animation: 1.5s ease-in-out bar;
}

.react {
  width: 60%;
  animation: 1.5s ease-in-out bar;
}

.svelte {
  width: 50%;
  animation: 1.5s ease-in-out bar;
}

.vue {
  width: 50%;
  animation: 1.5s ease-in-out bar;
}

@keyframes bar {
  0% {
    width: 0%;
  }
}

</style>

