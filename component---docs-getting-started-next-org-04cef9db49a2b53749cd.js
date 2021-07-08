(self.webpackChunk_orgajs_website=self.webpackChunk_orgajs_website||[]).push([[640],{49010:function(e,a,o){"use strict";o.r(a),o.d(a,{title:function(){return i},published:function(){return p},position:function(){return g}});var n=o(50120),r=(o(27378),o(64489)),t=(o(25444),o(16041)),s=["components"],i="Next.js",p="true",g="2";function c(e){var a=e.components,o=(0,n.Z)(e,s);return(0,r.orga)(t.Z,Object.assign({components:a},o),(0,r.orga)("p",null,"Use the next plugin for orga."),(0,r.orga)("div",{className:"section"},(0,r.orga)("h1",{parentName:"div"},"Installation"),(0,r.orga)("pre",{parentName:"div"},(0,r.orga)("code",{className:"language-sh",parentName:"pre"},"npm install --save @orgajs/loader @orgajs/react @orgajs/next"))),(0,r.orga)("div",{className:"section"},(0,r.orga)("h1",{parentName:"div"},"Configuration"),(0,r.orga)("p",{parentName:"div"},"Add the following to ",(0,r.orga)("code",{parentName:"p"},"next.config.js")),(0,r.orga)("pre",{parentName:"div"},(0,r.orga)("code",{className:"language-javascript",parentName:"pre"},"const withOrga = require('@orgajs/next')({\n  // extention: /\\.org$/\n})\n\nmodule.exports = withOrga({\n  pageExtensions: ['js', 'jsx', 'org']\n})"))),(0,r.orga)("div",{className:"section"},(0,r.orga)("h1",{parentName:"div"},"Customisation (optional)"),(0,r.orga)("p",{parentName:"div"},'You can add "shortcodes" for use within org files without importing them every time.'," ","Edit ",(0,r.orga)("code",{parentName:"p"},"pages/_app.js")," file."),(0,r.orga)("pre",{parentName:"div"},(0,r.orga)("code",{className:"language-javascript",parentName:"pre"},"import { OrgaProvider } from '@orgajs/react'\nimport Box from '../components/box'\n\nfunction MyApp({ Component, pageProps }) {\n  // add \"shortcodes\" by passing in react components via components prop\n  return (\n    <OrgaProvider components={{ Box }}>\n      <Component {...pageProps} />\n    </OrgaProvider>\n  )\n}\n\nexport default MyApp")),(0,r.orga)("p",{parentName:"div"},"After that, you can use ",(0,r.orga)("code",{parentName:"p"},"<Box/>")," component in org file without importing it.")))}c.isMDXComponent=!0,a.default=c}}]);
//# sourceMappingURL=component---docs-getting-started-next-org-04cef9db49a2b53749cd.js.map