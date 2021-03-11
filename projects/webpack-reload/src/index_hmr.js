import text from './text.js' 

const div = document.createElement('div') 
document.body.appendChild(div) 
function render() { 
  div.innerHTML = text; 
} 
render() 

// hmr热更新注册
if (module.hot) { 
  module.hot.accept("./text.js", function() { 
    render() 
    console.log('hmr')
  }) 
}