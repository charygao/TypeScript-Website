(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{"1P1P":function(e,t,n){"use strict";t.__esModule=!0,t.setupTwoslashHovers=void 0;var o=function(){var e=document.getElementById("twoslash-mouse-hover-info");e&&(e.style.display="none")},a=function(e){var t=e.target;if("DATA-LSP"!==t.nodeName)return o();var n,a,r,i,l=t.getAttribute("lsp"),s=(n=t,a=document.body.getBoundingClientRect(),{top:(r=n.getBoundingClientRect()).top-a.top,left:r.left-a.left}),c=((i=document.getElementById("twoslash-mouse-hover-info"))||((i=document.createElement("div")).style.position="absolute",i.id="twoslash-mouse-hover-info",document.body.appendChild(i)),i),u=document.createElement("textarea");u.innerHTML=l,c.textContent=u.value;c.style.display="block",c.style.top=s.top+20+"px",c.style.left=s.left+"px";var d=function e(t){return"pre"===t.nodeName.toLowerCase()?t.getBoundingClientRect():e(t.parentElement)}(t),m=s.left-d.x;c.style.maxWidth=d.width-m+"px"};t.setupTwoslashHovers=function(){var e=document.querySelectorAll(".shiki.lsp .code-container code");return e.forEach((function(e){e.addEventListener("mouseover",a),e.addEventListener("mouseout",o)})),function(){e.forEach((function(e){e.removeEventListener("mouseover",a),e.removeEventListener("mouseout",o)}))}}},"2oau":function(e,t,n){},dRaC:function(e,t,n){"use strict";n.r(t),n.d(t,"pageQuery",(function(){return d}));var o=n("ERkP"),a=n.n(o),r=n("9Dj+"),i=n("yVh0"),l=n("I56Z"),s=n("GO2c"),c=(n("2oau"),n("eo7b"),n("1P1P")),u=function(e){var t=Object(l.a)(Object(i.a)()),n=e.data.markdownRemark;if(!n)return console.log("Could not render:",JSON.stringify(e)),a.a.createElement("div",null);Object(o.useEffect)((function(){Object(c.setupTwoslashHovers)()}),[]);var s=e.pageContext.languageMeta;return a.a.createElement(r.a,{title:t("tsconfig_title"),description:t("tsconfig_description"),lang:e.pageContext.locale},a.a.createElement("div",{id:"glossary"},a.a.createElement("div",{className:"whitespace raised content main-content-block subheadline",style:{padding:"1rem",textAlign:"center"}},"This page is a work in progress, congrats on finding it!"),a.a.createElement("ul",{className:"filterable-quicklinks main-content-block"},s.terms.map((function(e){return a.a.createElement("li",{key:e.id},a.a.createElement("a",{href:"#"+e.id},e.display))}))),a.a.createElement("div",{dangerouslySetInnerHTML:{__html:n.html}})))},d="2838888368";t.default=function(e){return a.a.createElement(s.a,{locale:e.pageContext.locale},a.a.createElement(u,e))}},eo7b:function(e,t,n){}}]);
//# sourceMappingURL=component---src-templates-glossary-tsx-7909a1936ddfcd7138c7.js.map