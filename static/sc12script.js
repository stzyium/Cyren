let resultsContainer;const API_CONFIG={BASE_URL:"https://api.cyscan.io",ENDPOINTS:{SCAN:"/api/scan",STATUS:"/status"}},resourceTypes=[{key:"links",title:"Links",icon:"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"},{key:"images",title:"Images",icon:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"},{key:"scripts",title:"Scripts",icon:"M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"},{key:"styles",title:"CSS Styles",icon:"M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"}];function formatSecurityKey(e){return e.replace(/[_-]/g," ").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,e=>e.toUpperCase())}function getSecurityDescription(e,t){let s={hasSslCertificate:"Page has SSL certificate",hasLoginForm:"Page contains a login form",hasPasswordField:"Page contains a password field",insecureProtocol:"Page uses insecure HTTP protocol",hasCsp:"Page has Content Security Policy (CSP) enabled",hasXssProtection:"Page has XSS protection enabled",suspiciousScripts:Array.isArray(t)?`${t.length} suspicious scripts detected`:"Suspicious scripts detected on the page",interestingUrls:Array.isArray(t)?`${t.length} potentially interesting URLs found`:"Interesting URLs found on the page",defaultDescription:!0===t?"Feature is enabled":!1===t?"Feature is disabled":"Value: "+formatValue(t)};return s[e]||s.defaultDescription}function formatValue(e){return null===e?"null":void 0===e?"undefined":Array.isArray(e)?0===e.length?"empty array":e.length<=3?e.map(e=>formatValue(e)).join(", "):`${e.length} items`:"object"==typeof e?0===Object.keys(e).length?"empty object":e.url?e.url:e.name?e.name:e.id?e.id:"object with keys: "+Object.keys(e).join(", "):String(e)}function addNotification(e,t="info"){console.log(`%cNotification (${t}): ${e}`,"background: #333; color: white; padding: 2px 5px;");let s={success:"bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",error:"bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",warning:"bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800",info:"bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"},n={success:'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'},a=s[t]||s.info,r=n[t]||n.info,i=document.getElementById("notifications");if(!i){console.error("Notification container not found");return}let l=document.createElement("div");l.className=`flex items-center p-3 mb-2 rounded border ${a} opacity-0 transition-opacity duration-200`,l.innerHTML=`
        <div class="mr-2">${r}</div>
        <div>${e}</div>
    `,i.appendChild(l),setTimeout(()=>{l.classList.remove("opacity-0"),l.classList.add("opacity-100")},10),setTimeout(()=>{l.classList.remove("opacity-100"),l.classList.add("opacity-0"),setTimeout(()=>{i.removeChild(l)},200)},5e3)}function showNotification(e,t="info"){return addNotification(e,t)}function displayResults(e){if(console.log("Displaying scan results:",e),!resultsContainer&&!(resultsContainer=document.getElementById("scan-results"))){console.error("Scan results container (#scan-results) not found");return}if(!e){console.error("Results object is undefined"),resultsContainer.innerHTML=`
            <div class="alert alert-danger">
                <h4>Error: No Results Received</h4>
                <p>No scan results were received from the server.</p>
            </div>
        `;return}if(console.log("Results fields:",Object.keys(e)),console.log("targetUrl:",e.targetUrl),console.log("domain:",e.domain),console.log("scanType:",e.scanType),console.log("userAgent:",e.userAgent),console.log("timestamp:",e.timestamp),e.summary||(console.log("Creating missing summary object"),e.summary={total:0,suspicious:0,benign:0}),e.resources||(e.resources={links:[],images:[],scripts:[],styles:[]}),window.appState.lastResults=e,resultsContainer.innerHTML="",resultsContainer.classList.remove("hidden"),e.error){console.error("Error during scan:",e.error),resultsContainer.innerHTML=`
            <div class="alert alert-danger">
                <h4>An error occurred during scanning</h4>
                <p>${e.error}</p>
            </div>
        `;return}let t=e.userAgent||"unknown",s=e.domain||extractDomain(e.targetUrl),n=new Date(e.timestamp),a=n.toLocaleDateString()+" "+n.toLocaleTimeString(),r=e.resources?.links?.length||0,i=e.resources?.images?.length||0,l=e.resources?.scripts?.length||0,o=e.resources?.styles?.length||0,c=`
        <div class="mb-6">
            <h3 class="text-xl font-bold text-green-400 mb-2">URL Scan Results</h3>
            <div class="p-4 bg-gray-900 rounded border border-gray-700">
                <div class="flex flex-wrap justify-between">
                    <div class="w-full md:w-1/2 p-2">
                        <p class="mb-1"><span class="text-gray-500">URL:</span> <a href="${e.targetUrl}" target="_blank" class="text-blue-400 hover:underline">${e.targetUrl}</a></p>
                        <p class="mb-1"><span class="text-gray-500">Domain:</span> ${s}</p>
                        <p class="mb-1"><span class="text-gray-500">Scan Date:</span> ${a}</p>
                    </div>
                    <div class="w-full md:w-1/2 p-2">
                        <p class="mb-1"><span class="text-gray-500">Scan Type:</span> ${{quick:"Quick",standard:"Standard",deep:"Deep"}[e.scanType]||"Standard"}</p>
                        <p class="mb-1"><span class="text-gray-500">User Agent:</span> ${t}</p>
                        <p class="mb-1"><span class="text-gray-500">Fuzzing:</span> ${e.fuzzing&&Array.isArray(e.fuzzing)&&e.fuzzing.length>0||e.fuzzingResults&&Array.isArray(e.fuzzingResults)&&e.fuzzingResults.length>0?"Enabled":"Disabled"}</p>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-gray-800 rounded">
                    <div class="flex flex-wrap justify-between items-center mb-2">
                    <div>
                        <span class="text-gray-400">Total Resources:</span> 
                        <span class="font-bold text-white">${r+i+l+o}</span>
                    </div>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        <div title="Links" class="flex flex-col items-center justify-center p-2 bg-gray-700 rounded">
                            <div class="flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                            <div class="text-blue-400 font-bold">${r}</div>
                            <div class="text-xs text-gray-400">Links</div>
                        </div>
                        <div title="Images" class="flex flex-col items-center justify-center p-2 bg-gray-700 rounded">
                            <div class="flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                            <div class="text-green-400 font-bold">${i}</div>
                            <div class="text-xs text-gray-400">Images</div>
                        </div>
                        <div title="Scripts" class="flex flex-col items-center justify-center p-2 bg-gray-700 rounded">
                            <div class="flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                            <div class="text-red-400 font-bold">${l}</div>
                            <div class="text-xs text-gray-400">Scripts</div>
                        </div>
                        <div title="CSS Styles" class="flex flex-col items-center justify-center p-2 bg-gray-700 rounded">
                            <div class="flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            </div>
                            <div class="text-purple-400 font-bold">${o}</div>
                            <div class="text-xs text-gray-400">Styles</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;if(resultsContainer.innerHTML=c,e.pageMetadata){let d=`
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-green-400 mb-2">Page Information</h3>
                <div class="p-4 bg-gray-900 rounded border border-gray-700">
                    <div class="lg:flex lg:flex-row lg:gap-4">
                        <div class="lg:w-3/5">
                    ${e.pageMetadata.title?`
                    <p class="mb-2">
                        <span class="text-gray-500">Title:</span> 
                        <span class="text-white">${e.pageMetadata.title}</span>
                    </p>
                    `:""}
                    
                    ${e.pageMetadata.description?`
                    <p class="mb-2">
                        <span class="text-gray-500">Description:</span> 
                        <span class="text-white text-sm">${e.pageMetadata.description}</span>
                    </p>
                    `:""}
                    
                    ${e.pageMetadata.keywords?`
                    <p class="mb-2">
                        <span class="text-gray-500">Keywords:</span> 
                        <span class="text-white text-sm">${e.pageMetadata.keywords}</span>
                    </p>
                    `:""}
                    
                    ${e.pageMetadata.headers&&e.pageMetadata.headers.length>0?`
                    <div class="mt-4">
                                <div class="flex justify-between items-center mb-2">
                                    <p class="text-gray-500">HTTP Headers</p>
                                    <button id="toggle-headers" class="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                                Show Details
                            </button>
                        </div>
                                <div id="headers-container" class="hidden mt-2 max-h-60 overflow-y-auto">
                                    <div class="space-y-1">
                                    ${e.pageMetadata.headers.map(e=>`
                                            <div class="text-sm p-1 bg-gray-800 rounded">
                                                <span class="text-green-400">${e.name}:</span> 
                                                <span class="text-gray-300">${e.value}</span>
                                            </div>
                                    `).join("")}
                                    </div>
                        </div>
                    </div>
                    `:""}
                        </div>
                        
                        ${e.pageMetadata.screenshot?`
                        <div class="lg:w-2/5 mt-4 lg:mt-0">
                            <p class="mb-2 text-gray-500">Page Screenshot: 
                                <span class="text-sm ${"mobile"===e.pageMetadata.screenshotDeviceType?"text-yellow-400":"text-blue-400"}">
                                    (${"mobile"===e.pageMetadata.screenshotDeviceType?"Mobile View":"Desktop View"})
                                </span>
                            </p>
                            <div class="flex justify-center">
                                <div class="relative group cursor-pointer max-w-full">
                                    <img src="${e.pageMetadata.screenshot}" alt="Screenshot of ${e.url}" 
                                         class="rounded border border-gray-700 max-w-full h-auto max-h-48 object-contain" 
                                         id="page-screenshot" />
                                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                        <div class="text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `:""}
                    </div>
                    
                    ${e.pageMetadata.technologies&&e.pageMetadata.technologies.length>0?`
                    <div class="mt-4">
                        <p class="text-gray-500 mb-2">Technologies:</p>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${e.pageMetadata.technologies.map(e=>`<span class="px-2 py-1 bg-gray-800 rounded text-xs">${e.name?e.name+": "+e.value:e.value||e}</span>`).join("")}
                        </div>
                    </div>
                    `:""}
                </div>
            </div>
        `;resultsContainer.innerHTML+=d,setTimeout(()=>{let e=document.getElementById("toggle-headers"),t=document.getElementById("headers-container");e&&t&&e.addEventListener("click",function(){let e=t.classList.contains("hidden");t.classList.toggle("hidden"),this.textContent=e?"Hide Details":"Show Details"}),setTimeout(()=>{console.log("Calling screenshot zoom function after page content is loaded"),addScreenshotZoom()},200)},0)}if(e.networkInfo){let g=`
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-green-400 mb-2">Network Information</h3>
                <div class="p-4 bg-gray-900 rounded border border-gray-700">
                    ${e.networkInfo.dns&&e.networkInfo.dns.addresses&&e.networkInfo.dns.addresses.length>0?`
                    <div class="mb-4">
                        <span class="text-gray-500">DNS Addresses:</span>
                        <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${e.networkInfo.dns.addresses.map(e=>"string"==typeof e?`<div class="px-3 py-2 bg-gray-800 rounded text-sm">${e} (IPv4)</div>`:"object"==typeof e&&null!==e?`<div class="px-3 py-2 bg-gray-800 rounded text-sm">${e.address||e} (${e.type||"IPv4"})</div>`:"").join("")}
                        </div>
                    </div>
                    `:""}
                    
                    ${e.networkInfo.openPorts&&e.networkInfo.openPorts.length>0?`
                    <div class="mb-4">
                        <span class="text-gray-500">Open Ports:</span>
                        <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                            ${e.networkInfo.openPorts.map(e=>`<div class="px-3 py-2 bg-gray-800 rounded text-sm">
                                    Port ${e.port} 
                                    ${e.service?`<span class="text-green-400">(${e.service})</span>`:""}
                                </div>`).join("")}
                        </div>
                    </div>
                    `:""}
                    
                    ${e.networkInfo.whois&&(e.networkInfo.whois.registrar||e.networkInfo.whois.creationDate)?`
                    <div>
                        <span class="text-gray-500">WHOIS Information:</span>
                        <div class="mt-2 grid grid-cols-1 gap-2 text-sm">
                            ${e.networkInfo.whois.registrar?`
                            <div class="px-3 py-2 bg-gray-800 rounded">
                                <span class="text-gray-400">Registrar:</span> ${e.networkInfo.whois.registrar}
                            </div>
                            `:""}
                            
                            ${e.networkInfo.whois.creationDate?`
                            <div class="px-3 py-2 bg-gray-800 rounded">
                                <span class="text-gray-400">Creation Date:</span> ${new Date(e.networkInfo.whois.creationDate).toLocaleDateString()}
                            </div>
                            `:""}
                            
                            ${e.networkInfo.whois.expirationDate?`
                            <div class="px-3 py-2 bg-gray-800 rounded">
                                <span class="text-gray-400">Expiration Date:</span> ${new Date(e.networkInfo.whois.expirationDate).toLocaleDateString()}
                            </div>
                            `:""}
                        </div>
                    </div>
                    `:""}
                </div>
            </div>
        `;resultsContainer.innerHTML+=g}if(e.securityAnalysis&&Object.keys(e.securityAnalysis).length>0&&updateSecuritySection(e.securityAnalysis),e.interestingUrls&&e.interestingUrls.length>0){let u=`
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-yellow-400 mb-2">Interesting URLs (${e.interestingUrls.length})</h3>
                <div class="p-4 bg-gray-900 rounded border border-gray-700">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-gray-800">
                                <tr>
                                    <th class="px-4 py-2">URL</th>
                                    <th class="px-4 py-2">Type</th>
                                    <th class="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${e.interestingUrls.map(e=>`
                                <tr class="border-b border-gray-700">
                                    <td class="px-4 py-2 font-medium text-blue-400">
                                        <a href="${e.url}" target="_blank" class="hover:underline">${e.url}</a>
                                    </td>
                                    <td class="px-4 py-2">${e.type||"Unknown"}</td>
                                    <td class="px-4 py-2">
                                        <div class="flex space-x-2">
                                            <a href="${e.url}" target="_blank" class="text-xs bg-blue-900 hover:bg-blue-800 text-white px-2 py-1 rounded">
                                                Open
                                            </a>
                                            <a href="https://www.virustotal.com/gui/url/${encodeURIComponent(e.url)}" target="_blank" class="text-xs bg-purple-900 hover:bg-purple-800 text-white px-2 py-1 rounded">
                                                VT
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;resultsContainer.innerHTML+=u}addResourceSections(e.resources);let $=e.fuzzing||e.fuzzingResults||[];if(Array.isArray($)&&$.length>0){let p=[...$].sort((e,t)=>200===e.status&&200!==t.status?-1:200!==e.status&&200===t.status?1:e.url.localeCompare(t.url)),m=`
            <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold text-green-400">Fuzzing Results (${p.length})</h3>
                    <button id="expand-all-fuzzing" class="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded">
                        Expand All
                    </button>
                </div>
                <div class="p-4 bg-gray-900 rounded border border-gray-700">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-gray-800">
                                <tr>
                                    <th class="px-4 py-2">URL</th>
                                    <th class="px-4 py-2">Status</th>
                                    <th class="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${p.map((e,t)=>`
                                <tr class="border-b border-gray-700">
                                    <td class="px-4 py-2 font-medium text-blue-400">
                                        <a href="${e.url}" target="_blank" class="hover:underline">${e.url}</a>
                                    </td>
                                    <td class="px-4 py-2">
                                        <span class="px-2 py-1 rounded text-xs ${200===e.status?"bg-green-900/50 text-green-400":404===e.status?"bg-gray-800 text-gray-400":403===e.status?"bg-red-900/50 text-red-400":401===e.status?"bg-yellow-900/50 text-yellow-400":"bg-blue-900/50 text-blue-400"}">
                                            ${e.status}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2">
                                        <div class="flex space-x-2">
                                            <a href="${e.url}" target="_blank" class="text-xs bg-blue-900 hover:bg-blue-800 text-white px-2 py-1 rounded">
                                                Open
                                            </a>
                                            <button data-details-id="fuzzing-details-${t}" class="toggle-details text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded">
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr id="fuzzing-details-${t}" class="details-row hidden">
                                    <td colspan="3" class="px-4 py-2 bg-gray-800">
                                        <div class="text-sm">
                                            <p class="mb-1"><span class="text-gray-400">Content Type:</span> ${e.contentType||"Unknown"}</p>
                                            <p class="mb-1"><span class="text-gray-400">Size:</span> ${e.size?formatBytes(e.size):"Unknown"}</p>
                                            ${e.error?`<p class="text-red-400">Error: ${e.error}</p>`:""}
                                        </div>
                                    </td>
                                </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;resultsContainer.innerHTML+=m,setTimeout(()=>{let e=document.querySelectorAll(".toggle-details");e.forEach(e=>{e.addEventListener("click",function(){let e=this.getAttribute("data-details-id"),t=document.getElementById(e);t&&(t.classList.toggle("hidden"),this.textContent=t.classList.contains("hidden")?"Details":"Hide")})});let t=document.getElementById("expand-all-fuzzing");t&&t.addEventListener("click",function(){let e=document.querySelectorAll(".details-row"),t=Array.from(e).every(e=>e.classList.contains("hidden"));e.forEach(e=>{t?e.classList.remove("hidden"):e.classList.add("hidden")}),this.textContent=t?"Collapse All":"Expand All";let s=document.querySelectorAll(".toggle-details");s.forEach(e=>{e.textContent=t?"Hide":"Details"})})},100)}}function extractDomain(e){try{if(!e)return"";e.startsWith("http://")||e.startsWith("https://")||(e="https://"+e);let t=new URL(e);return t.hostname}catch(s){console.error("Error parsing URL:",s);let n=e.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/);return n?n[1]:e}}function getApiUrl(){let e="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;return e?"https://your-domain-vercel.vercel.app/api/scan":"http://localhost:3000/api/scan"}function saveSettings(){localStorage.setItem("showImages",window.appState.showImages),localStorage.setItem("fuzzingEnabled",window.appState.fuzzingEnabled),localStorage.setItem("darkMode",window.appState.darkMode),localStorage.setItem("userAgent",window.appState.userAgent),console.log("Settings saved:",{showImages:window.appState.showImages,fuzzingEnabled:window.appState.fuzzingEnabled,darkMode:window.appState.darkMode,userAgent:window.appState.userAgent}),window.appState.lastResults&&displayResults(window.appState.lastResults)}function loadSettings(){window.appState.showImages="false"!==localStorage.getItem("showImages"),window.appState.fuzzingEnabled="true"===localStorage.getItem("fuzzingEnabled"),window.appState.darkMode="true"===localStorage.getItem("darkMode"),window.appState.userAgent=localStorage.getItem("userAgent")||"pc",console.log("Ustawienia załadowane z localStorage:",{showImages:window.appState.showImages,fuzzingEnabled:window.appState.fuzzingEnabled,darkMode:window.appState.darkMode,userAgent:window.appState.userAgent})}function setUserAgent(e,t=!1){console.log("Setting user-agent:",e),localStorage.setItem("selectedUserAgent",e),localStorage.setItem("userAgent",e),window.appState.userAgent=e;let s=document.getElementById("pcButton"),n=document.getElementById("mobileButton");s&&n&&("pc"===e?(s.classList.add("active","btn-primary"),s.classList.remove("btn-outline-primary"),n.classList.remove("active","btn-primary"),n.classList.add("btn-outline-primary")):(n.classList.add("active","btn-primary"),n.classList.remove("btn-outline-primary"),s.classList.remove("active","btn-primary"),s.classList.add("btn-outline-primary")));let a=document.getElementById("pc-agent"),r=document.getElementById("mobile-agent"),i=document.getElementById("user-agent-display");a&&r&&(a.className="px-3 py-1 rounded text-white text-sm",r.className="px-3 py-1 rounded text-white text-sm","mobile"===e?(a.classList.add("bg-gray-700","hover:bg-gray-600"),r.classList.add("bg-green-700","hover:bg-green-600"),i&&(i.textContent="Mobile")):(a.classList.add("bg-green-700","hover:bg-green-600"),r.classList.add("bg-gray-700","hover:bg-gray-600"),i&&(i.textContent="PC"))),t&&addNotification("mobile"===e?"Mobile scanning mode enabled":"PC scanning mode enabled","info"),console.log("User-agent set to:",window.appState.userAgent)}function init(){console.log("Initializing scanner app..."),window.renderResourceTable=renderResourceTable,window.attachImagePreviewListeners=function(e){let t=e.querySelectorAll(".preview-image");t.forEach(t=>{t.addEventListener("click",function(){let t=this.getAttribute("data-url"),s=Array.from(e.querySelectorAll(".preview-image")).indexOf(this),n=e.querySelector(`#img-preview-${s}`);n&&(n.classList.contains("hidden")?(n.innerHTML=`<td colspan="6" class="px-4 py-2 text-center"><img src="${t}" alt="Preview" class="max-w-full mx-auto max-h-64 rounded"></td>`,n.classList.remove("hidden"),this.textContent="Hide Preview"):(n.classList.add("hidden"),this.textContent="Preview"))})})},window.appState={scanning:!1,lastResults:null,lastScanUrl:null,lastScanType:"standard",lastUserAgent:"pc",lastEnableFuzzing:!1},loadSettings(),document.getElementById("scan-form"),document.getElementById("url-input"),resultsContainer=document.getElementById("scan-results"),document.addEventListener("click",function(e){let t=e.target.closest(".show-all-resources");if(t){console.log("Show all button clicked via global handler");let s=t.getAttribute("data-type");console.log("Resource type:",s);let n=document.getElementById(`resource-content-${s}`);if(n&&window.appState.lastResults){let a=window.appState.lastResults.resources||{},r=a[s]||[];r.length>0&&(console.log(`Rendering all ${r.length} items of type ${s}`),n.innerHTML=renderResourceTable(r,s,!0),"images"===s&&attachImagePreviewListeners(n))}}});let e=document.getElementById("show-images-toggle");e&&(console.log("Found image toggle switch, setting state:",window.appState.showImages),e.checked=window.appState.showImages,e.addEventListener("change",function(){console.log("Image display setting changed:",this.checked),window.appState.showImages=this.checked,localStorage.setItem("showImages",this.checked),window.appState.lastResults&&displayResults(window.appState.lastResults)}));let t=document.getElementById("fuzzing-toggle");t&&(console.log("Found fuzzing toggle switch, setting state:",window.appState.fuzzingEnabled),t.checked=window.appState.fuzzingEnabled,t.addEventListener("change",function(){console.log("Fuzzing setting changed:",this.checked),window.appState.fuzzingEnabled=this.checked,localStorage.setItem("fuzzingEnabled",this.checked)}));let s=document.getElementById("pcButton"),n=document.getElementById("mobileButton");s&&s.addEventListener("click",function(){setUserAgent("pc",!0)}),n&&n.addEventListener("click",function(){setUserAgent("mobile",!0)});let a=document.getElementById("pc-agent"),r=document.getElementById("mobile-agent");a&&a.addEventListener("click",window.clickPcAgent),r&&r.addEventListener("click",window.clickMobileAgent);let i=localStorage.getItem("userAgent")||localStorage.getItem("selectedUserAgent")||"pc";setUserAgent(i,!1)}function updateScanTypeButtons(e){let t=document.getElementById("quick-scan"),s=document.getElementById("deep-scan"),n=document.getElementById("scan-type-display");document.querySelectorAll(".scan-type-btn").forEach(e=>{e.classList.remove("active")}),"quick"===e&&t?(t.classList.add("active"),n&&(n.textContent="Quick")):"deep"===e&&s?(s.classList.add("active"),n&&(n.textContent="Deep")):n&&(n.textContent="Standard")}function adjustResourceDisplay(){let e=document.querySelectorAll(".resource-tab");document.querySelectorAll(".resource-content"),window.innerWidth<640?e.forEach(e=>{e.classList.add("text-xs","px-2","py-1"),e.classList.remove("px-4","py-2")}):e.forEach(e=>{e.classList.remove("text-xs","px-2","py-1"),e.classList.add("px-4","py-2")})}function addResourceSections(e){if(console.log("Adding resource sections:",e),!e||!resultsContainer){console.log("No resources or results container not found");return}let t=!1;if(resourceTypes.forEach(s=>{e[s.key]&&e[s.key].length>0&&(t=!0,console.log(`Found ${e[s.key].length} resources of type ${s.key}`))}),!t){console.log("No resources found to display");return}let s=`
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-green-400 mb-2">Resources</h3>
            <div class="p-4 bg-gray-900 rounded border border-gray-700">
                <div class="mb-4">
                    <div class="flex border-b border-gray-700">
                        ${resourceTypes.map((t,s)=>`
                            <button class="resource-tab py-2 px-4 ${0===s?"text-green-500 border-b-2 border-green-500":"text-gray-400"}" 
                                data-tab="${t.key}">
                                <div class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${t.icon}" />
                                    </svg>
                                    ${t.title}
                                    <span class="ml-2 text-xs bg-gray-800 rounded-full px-2 py-1">
                                        ${e[t.key]?.length||0}
                                    </span>
                                </div>
                            </button>
                        `).join("")}
                    </div>
                </div>
                
                ${resourceTypes.map((t,s)=>`
                    <div id="resource-content-${t.key}" class="resource-content ${0===s?"":"hidden"}">
                        ${renderResourceTable(e[t.key]||[],t.key)}
                    </div>
                `).join("")}
            </div>
        </div>
    `;console.log("Adding resources HTML to results container"),resultsContainer.innerHTML+=s,setTimeout(()=>{console.log("Setting up resource tabs interactivity");let e=document.querySelectorAll(".resource-tab");console.log(`Found ${e.length} resource tabs`),e.forEach(e=>{e.addEventListener("click",function(){console.log(`Tab clicked: ${this.getAttribute("data-tab")}`),document.querySelectorAll(".resource-tab").forEach(e=>{e.classList.remove("text-green-500","border-b-2","border-green-500"),e.classList.add("text-gray-400")}),this.classList.add("text-green-500","border-b-2","border-green-500"),this.classList.remove("text-gray-400"),document.querySelectorAll(".resource-content").forEach(e=>{e.classList.add("hidden")});let e=this.getAttribute("data-tab"),t=document.getElementById(`resource-content-${e}`);t?(t.classList.remove("hidden"),console.log(`Showing content for tab: ${e}`)):console.log(`Content element for tab ${e} not found`)})}),console.log("Initializing results interactivity"),initResultsInteractivity()},0)}function renderResourceTable(e,t,s=!1){if(console.log(`Rendering resource table for ${t}, showAllItems: ${s}, items: ${e?.length||0}`),!e||0===e.length)return console.log(`No ${t} found.`),`<p class="text-gray-400">No ${t} found.</p>`;let n,a;switch(t){case"links":n=["URL","Text","Type"],a=(e,t)=>`
                <tr class="border-b border-gray-700">
                    <td class="px-4 py-2">
                        <a href="${e.url}" target="_blank" class="text-blue-400 hover:underline">${e.url}</a>
                    </td>
                    <td class="px-4 py-2 max-w-xs truncate" title="${e.text||"No text"}">${e.text||"No text"}</td>
                    <td class="px-4 py-2">
                        <span class="px-2 py-1 bg-${e.isInternal?"green":"orange"}-900/30 text-${e.isInternal?"green":"orange"}-400 rounded text-xs">
                            ${e.isInternal?"Internal":"External"}
                        </span>
                    </td>
                </tr>
            `,e=[...e].sort((e,t)=>e.isInternal&&!t.isInternal?1:!e.isInternal&&t.isInternal?-1:e.url.localeCompare(t.url));break;case"images":n=["URL","Alt Text","Dimensions","Actions"],a=(e,t)=>`
                <tr class="border-b border-gray-700">
                    <td class="px-4 py-2">
                        <a href="${e.url}" target="_blank" class="text-blue-400 hover:underline">${e.url}</a>
                    </td>
                    <td class="px-4 py-2 max-w-xs truncate" title="${e.alt||"No alt text"}">${e.alt||"No alt text"}</td>
                    <td class="px-4 py-2">${e.width||"?"}\xd7${e.height||"?"}</td>
                    <td class="px-4 py-2">
                        <button class="preview-image px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs" data-url="${e.url}">
                            Preview
                        </button>
                    </td>
                </tr>
                <tr id="img-preview-${t}" class="hidden"></tr>
            `;break;case"scripts":n=["URL","Type"],a=(e,t)=>`
                <tr class="border-b border-gray-700">
                    <td class="px-4 py-2">
                        <a href="${e.url}" target="_blank" class="text-blue-400 hover:underline">${e.url}</a>
                    </td>
                    <td class="px-4 py-2">${e.type||"text/javascript"}</td>
                </tr>
            `;break;case"styles":n=["URL","Media"],a=(e,t)=>`
                <tr class="border-b border-gray-700">
                    <td class="px-4 py-2">
                        <a href="${e.url}" target="_blank" class="text-blue-400 hover:underline">${e.url}</a>
                    </td>
                    <td class="px-4 py-2">${e.media||"all"}</td>
                </tr>
            `;break;default:return`<div class="p-4 bg-red-900/30 text-red-400 rounded">Unknown resource type: ${t}</div>`}let r=e.length>30&&!s;console.log(`Should show 'Show All' button: ${r}, items.length: ${e.length}, DEFAULT_LIMIT: 30, showAllItems: ${s}`);let i=s?e:e.slice(0,30);console.log(`Displaying ${i.length} out of ${e.length} items`);let l=`
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
                <thead class="text-xs uppercase bg-gray-800">
                    <tr>
                        ${n.map(e=>`<th class="px-4 py-2">${e}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${i.map((e,t)=>a(e,t)).join("")}
                </tbody>
            </table>
            ${r?`
            <div class="mt-3 text-center">
                <p class="text-gray-500 text-sm">${e.length-i.length} more items not shown</p>
                <button 
                    class="show-all-resources mt-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm cursor-pointer" 
                    data-type="${t}"
                    onclick="(function(e) { 
                        console.log('Inline click handler for Show All button'); 
                        const resourceType = e.target.getAttribute('data-type');
                        const tabContent = document.getElementById('resource-content-' + resourceType);
                        if (tabContent && window.appState.lastResults) {
                            const resources = window.appState.lastResults.resources || {};
                            const items = resources[resourceType] || [];
                            if (items.length > 0) {
                                tabContent.innerHTML = window.renderResourceTable(items, resourceType, true);
                                if (resourceType === 'images') {
                                    window.attachImagePreviewListeners(tabContent);
                                }
                            }
                        }
                        e.stopPropagation();
                    })(event)"
                >
                    Show All ${e.length} Items
                </button>
            </div>
            `:""}
        </div>
    `;return console.log(`Table HTML generated, length: ${l.length}, contains 'Show All' button: ${l.includes("Show All")}`),l}function initResultsInteractivity(){let e=document.querySelectorAll(".toggle-section");e.forEach(e=>{e.addEventListener("click",function(){let e=this.getAttribute("data-section"),t=document.getElementById(e);if(t){let s=t.classList.contains("max-h-60");s?(t.classList.remove("max-h-60"),this.textContent="Show Less"):(t.classList.add("max-h-60"),this.textContent="Show All")}})});let t=document.getElementById("toggle-headers");function s(){let e=document.querySelectorAll(".show-all-resources");console.log("Found show-all-resources buttons:",e.length),e.forEach((e,t)=>{console.log(`Button ${t+1} data-type:`,e.getAttribute("data-type"));let s=e.cloneNode(!0);e.parentNode.replaceChild(s,e),s.addEventListener("click",function(e){console.log("Show all button clicked with data-type:",this.getAttribute("data-type")),n.call(this,e)})})}function n(e){console.log("Show all resources button clicked!");let t=this.getAttribute("data-type");console.log("Resource type:",t);let n=document.getElementById(`resource-content-${t}`);if(console.log("Tab content element:",n?"found":"not found"),n&&window.appState.lastResults){console.log("Last results available:",window.appState.lastResults?"yes":"no");let a=window.appState.lastResults.resources||{};console.log("Resources available:",Object.keys(a));let r=a[t]||[];if(console.log(`Items for ${t}:`,r.length),r.length>0){console.log("Rendering table with all items");let i=renderResourceTable(r,t,!0);console.log("Table HTML generated, length:",i.length),n.innerHTML=i,console.log("Table HTML inserted into DOM"),console.log(`Pokazano wszystkie elementy typu: ${t} (${r.length})`),"images"===t&&(console.log("Attaching image preview listeners"),function e(t){let s=t.querySelectorAll(".preview-image");s.forEach(e=>{e.addEventListener("click",function(){let e=this.getAttribute("data-url"),s=Array.from(t.querySelectorAll(".preview-image")).indexOf(this),n=t.querySelector(`#img-preview-${s}`);n&&(n.classList.contains("hidden")?(n.innerHTML=`<td colspan="6" class="px-4 py-2 text-center"><img src="${e}" alt="Preview" class="max-w-full mx-auto max-h-64 rounded"></td>`,n.classList.remove("hidden"),this.textContent="Hide Preview"):(n.classList.add("hidden"),this.textContent="Preview"))})})}(n)),console.log("Re-attaching show all button listeners"),s()}else console.log(`No items found for resource type: ${t}`)}else console.log("Tab content or last results not available")}t&&t.addEventListener("click",function(){let e=document.getElementById("headers-details");e&&(e.classList.toggle("hidden"),this.textContent=e.classList.contains("hidden")?"Show Details":"Hide Details")}),s();let a=document.querySelectorAll(".preview-image");a.forEach(e=>{e.addEventListener("click",function(){let e=this.getAttribute("data-url"),t=Array.from(a).indexOf(this),s=document.getElementById(`img-preview-${t}`);s&&(s.classList.contains("hidden")?(s.innerHTML=`<td colspan="6" class="px-4 py-2 text-center"><img src="${e}" alt="Preview" class="max-w-full mx-auto max-h-64 rounded"></td>`,s.classList.remove("hidden"),this.textContent="Hide Preview"):(s.classList.add("hidden"),this.textContent="Preview"))})})}async function checkApiStatus(){try{console.log("Checking API status..."),console.log("API URL:",`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATUS}`);let e=await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATUS}`,{method:"GET",headers:{"Content-Type":"application/json"}});if(!e.ok)throw Error(`API status check failed: ${e.status} ${e.statusText}`);let t=await e.json();return console.log("API status:",t),{success:!0,data:t}}catch(s){return console.error("API status check error:",s),{success:!1,error:s.message}}}async function performScan(e,t,s,n){let a=null;try{if(window.resultsDisplayed=!1,window.appState.lastScanUrl=e,window.appState.lastScanType=t,window.appState.lastUserAgent=s,window.appState.lastEnableFuzzing=n,!e)throw Error("URL is required");updateScanUI(!0),startProgressSimulation();let r=await checkApiStatus();if(!r.success)throw Error(`API is not available: ${r.error}`);if(showNotification("Scan started...","info"),!e||e.startsWith("http://")||e.startsWith("https://")||(e="https://"+e),!e)throw Error("URL is empty or missing");let i={url:e,scanType:t||"standard",userAgent:s||"pc",enableFuzzing:n||!1};if(console.log("Sending scan request with data:",i),!i.url)throw Error("URL is missing from scan data");if(!i.url.startsWith("http://")&&!i.url.startsWith("https://"))throw Error("URL must start with http:// or https://");addConsoleOutput(`Scanning URL: ${i.url}`,"info"),addConsoleOutput(`Scan type: ${i.scanType} | Agent: ${i.userAgent} | Fuzzing: ${i.enableFuzzing?"enabled":"disabled"}`,"info");let l=new AbortController,o=setTimeout(()=>l.abort(),6e5);try{let c=await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCAN}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i),signal:l.signal});if(clearTimeout(o),!c.ok)try{let d=await c.json();throw Error(d.error||`Error during scanning (${c.status})`)}catch(g){throw Error(`Request failed with status ${c.status}: ${c.statusText}`)}let u=c.body.getReader(),$=new TextDecoder,p="";console.log("Starting to read response stream");let m=!1;for(;;){let{value:h,done:y}=await u.read();if(y){console.log("Stream reading completed");break}p+=$.decode(h,{stream:!0});try{let f=JSON.parse(p);if(console.log("Received complete JSON response in one chunk"),f.progress&&Array.isArray(f.progress)&&f.progress.forEach(e=>{if(e.message&&"number"==typeof e.percent)updateScanProgress(e.percent,e.message),addConsoleOutput(`[PROGRESS] ${e.percent}% - ${e.message}`,"info");else if("fuzzing_log"===e.type&&e.rawMessage)addConsoleOutput(e.rawMessage,"info");else if("fuzzing_result"===e.type){let t=e.status>=200&&e.status<300?"success":e.status>=300&&e.status<400?"info":e.status>=400&&e.status<500?"warning":"error";addConsoleOutput(`[${e.status}] ${e.path} (${e.contentType||"unknown"})`,t)}}),f.finalResult)a=f.finalResult;else if(f.error)throw Error(f.error);m=!0;break}catch(x){}console.log(`Received ${h.length} bytes, buffer size: ${p.length}`)}if(console.log("Stream processing completed"),a)console.log("Final data available, displaying results"),prepareResultData(a),displayResults(a),showNotification("Scan completed!","success");else try{console.log("Trying to parse complete buffer:",p.substring(0,100)+"...");let v=p;v.includes('"progress":[')&&!v.includes('],"finalResult"')&&(console.log("Fixing incomplete JSON by adding missing array closing bracket"),v=v.replace('"progress":[','"progress":[{}')+'],"finalResult":null}');try{let b=JSON.parse(v);if(b.finalResult)a=b.finalResult,prepareResultData(a),displayResults(a),showNotification("Scan completed!","success");else if(b.error)throw Error(b.error);else throw Error("Incomplete response received from server")}catch(w){throw console.error("Failed to parse fixed buffer:",w),Error("JSON Parse error: "+w.message)}}catch(_){throw console.error("Error parsing response:",_),Error("Failed to process server response: "+_.message)}return updateScanUI(!1),a}catch(k){if(clearTimeout(o),"AbortError"===k.name)throw Error("Scan request timeout - the server took too long to respond");throw k}}catch(S){if(console.error("Error during scan:",S),S.message.includes("429")){let I="Sorry, due to the large number of scans, new scans are not currently being processed. Come back in 3 minutes";addConsoleOutput(`[ERROR] ${I}`,"error"),showNotification(I,"error")}else addConsoleOutput(`[ERROR] ${S.message}`,"error"),showNotification(`Scan error: ${S.message}`,"error");return addConsoleOutput("Try scanning a different URL or check your network connection","info"),updateScanUI(!1),null}}function updateScanUI(e){console.log("Updating scan UI, isScanning:",e);let t=document.getElementById("scanning-ui"),s=document.getElementById("scan-results"),n=document.getElementById("scan-form");if(e){t&&t.classList.remove("hidden"),n&&n.classList.add("opacity-50","pointer-events-none"),s&&s.classList.add("hidden"),updateScanProgress(0,"Initializing scan...");let a=document.getElementById("scanner-console-container");a&&a.classList.remove("hidden")}else t&&t.classList.add("hidden"),n&&n.classList.remove("opacity-50","pointer-events-none"),s&&s.classList.remove("hidden")}function updateScanProgress(e,t){let s=document.getElementById("scan-progress-bar"),n=document.getElementById("scan-progress-percent"),a=document.getElementById("scan-status-text");s&&(s.style.width=`${e}%`),n&&(n.textContent=`${e}%`),a&&t&&(a.textContent=t),t&&addConsoleOutput(`Status: ${t} (${e}%)`,"info")}function startProgressSimulation(){let e=[{percent:10,status:"Initializing scan...",delay:500},{percent:20,status:"Starting browser...",delay:1e3},{percent:30,status:"Loading page...",delay:2e3},{percent:50,status:"Analyzing content...",delay:2e3},{percent:70,status:"Collecting network information...",delay:1500},{percent:85,status:"Security analysis...",delay:1500},{percent:95,status:"Finalizing results...",delay:1e3}],t=0;!function s(){if(t<e.length){let n=e[t];updateScanProgress(n.percent,n.status),t++,window.appState.scanning&&setTimeout(s,n.delay)}}()}function clearResults(){console.log("Czyszczenie poprzednich wynik\xf3w");let e=document.getElementById("scan-results");e&&(e.innerHTML="",e.classList.add("hidden"));let t=document.getElementById("notifications");t&&(t.innerHTML="");let s=document.getElementById("scanner-console");s&&(s.innerHTML=""),window.appState.lastResults=null,console.log("Wyniki zostały wyczyszczone")}function addConsoleOutput(e,t="info"){let s=document.getElementById("scanner-console");if(s){let n=document.createElement("div");n.className=`console-message ${t}`,n.textContent=e,s.appendChild(n),s.scrollTop=s.scrollHeight}else console.error("Element scanner-console nie został znaleziony.")}function displayScanResults(e){let t=document.getElementById("scan-results");if(!t){console.error("Results container not found");return}clearResults();let s=prepareResultData(e);if(!s){showNotification("No data received from scan","error");return}console.log("Full scan results:",e),console.log("Security analysis data available in results:",!!e.securityAnalysis),console.log("Security analysis data available in processed data:",!!s.securityAnalysis),s.securityAnalysis?(console.log("Security analysis data structure:",Object.keys(s.securityAnalysis)),console.log("Security analysis data details:",JSON.stringify(s.securityAnalysis,null,2))):console.error("No security analysis data available"),displayBasicScanInfo(e),s.securityAnalysis&&updateSecuritySection(s.securityAnalysis),e.resources&&addResourceSections(e.resources),e.technologies&&Array.isArray(e.technologies)&&e.technologies.length>0&&updateTechnologiesSection(e.technologies),e.vulnerabilities&&Array.isArray(e.vulnerabilities)&&e.vulnerabilities.length>0&&updateVulnerabilitiesSection(e.vulnerabilities),t.style.display="block",t.classList.remove("hidden"),initResultsInteractivity(),showNotification("Scan completed successfully","success"),setTimeout(()=>{console.log("Adding screenshot zoom after scan results are displayed"),addScreenshotZoom()},300)}function displayBasicScanInfo(e){let t=document.getElementById("scan-results");if(!t)return;t.classList.remove("hidden");let s=e.resources?.links?.length||0,n=e.resources?.images?.length||0,a=e.resources?.scripts?.length||0,r=e.resources?.styles?.length||0,i=`
        <div class="mb-4">
            <h4 class="text-md font-semibold text-gray-500 mb-2">Resources</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div title="Links" class="flex flex-col items-center justify-center p-2 bg-gray-800 rounded">
                    <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                        </svg>
                    </div>
                    <div class="text-blue-400 font-bold">${s}</div>
                    <div class="text-xs text-gray-400">Links</div>
                </div>
                <div title="Images" class="flex flex-col items-center justify-center p-2 bg-gray-800 rounded">
                    <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div class="text-green-400 font-bold">${n}</div>
                    <div class="text-xs text-gray-400">Images</div>
                </div>
                <div title="Scripts" class="flex flex-col items-center justify-center p-2 bg-gray-800 rounded">
                    <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div class="text-red-400 font-bold">${a}</div>
                    <div class="text-xs text-gray-400">Scripts</div>
                </div>
                <div title="CSS Styles" class="flex flex-col items-center justify-center p-2 bg-gray-800 rounded">
                    <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                    <div class="text-purple-400 font-bold">${r}</div>
                    <div class="text-xs text-gray-400">Styles</div>
                </div>
            </div>
        </div>
    `,l=`
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-green-400 mb-2">URL Scan Results</h3>
            <div class="p-4 bg-gray-900 rounded border border-gray-700">
                <div class="mb-4">
                    <span class="text-gray-500">URL:</span> 
                    <a href="${e.url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline break-all">
                        ${e.url}
                    </a>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-gray-500">Domain:</span> 
                        <span class="text-white">${e.domain||"N/A"}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Scan Type:</span> 
                        <span class="text-white">${e.scanType||"Standard"}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <span class="text-gray-500">Scan Time:</span> 
                        <span class="text-white">${formatTimestamp(e.timestamp)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Status Code:</span> 
                        <span class="${getStatusCodeColor(e.statusCode)}">${e.statusCode||"N/A"}</span>
                    </div>
                </div>
                
                ${i}
            </div>
        </div>
    `;t.innerHTML=l}function updateTechnologiesSection(e){let t=document.getElementById("scan-results");if(!e||0===e.length){console.log("No technologies detected");return}console.log("Displaying detected technologies:",e);let s={};e.forEach(e=>{let t=e.category||"Other";s[t]||(s[t]=[]),s[t].push(e)});let n="";Object.entries(s).forEach(([e,t])=>{let s=t.map(e=>{let t=e.confidence?`<span class="ml-2 text-xs px-2 py-0.5 rounded-full ${"high"===e.confidence?"bg-green-800 text-green-200":"medium"===e.confidence?"bg-yellow-800 text-yellow-200":"bg-red-800 text-red-200"}">${e.confidence}</span>`:"";return`
                <div class="flex items-center justify-between p-2 border-b border-gray-700">
                    <span class="font-medium">${e.name}</span>
                    <div class="flex items-center">
                        <span class="text-gray-400">${e.version||"unknown"}</span>
                        ${t}
                    </div>
                </div>
            `}).join("");n+=`
            <div class="mb-3">
                <h4 class="text-md font-medium text-green-400 mb-2">${e}</h4>
                <div class="bg-gray-800 rounded overflow-hidden">
                    ${s}
                </div>
            </div>
        `});let a=`
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-green-400 mb-2">Detected Technologies</h3>
        <div class="p-4 bg-gray-900 rounded border border-gray-700">
            ${n}
        </div>
    </div>
    `;t.innerHTML=a+t.innerHTML}function updateVulnerabilitiesSection(e){let t=document.getElementById("scan-results");if(!e||0===e.length){console.log("No vulnerabilities detected");return}console.log("Displaying detected vulnerabilities:",e);let s=e=>{switch(e){case"CRITICAL":return"text-red-500";case"HIGH":return"text-red-400";case"MEDIUM":return"text-yellow-400";case"LOW":return"text-green-400";default:return"text-gray-400"}},n=e.map(e=>{let t=s(e.severity),n="N/A"!==e.cvssScore?`(${e.cvssScore})`:"",a=e.references&&e.references.length>0?`<div class="mt-2">
                <span class="text-xs text-gray-400">References:</span>
                <ul class="ml-2 text-xs">
                    ${e.references.slice(0,3).map(e=>`<li><a href="${e}" target="_blank" class="text-blue-400 hover:underline">${e.substring(0,50)}${e.length>50?"...":""}</a></li>`).join("")}
                    ${e.references.length>3?`<li class="text-gray-500">+${e.references.length-3} more...</li>`:""}
                </ul>
            </div>`:"";return`
            <div class="p-3 mb-3 bg-gray-800 rounded border border-gray-700">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-medium">${e.cveId}</div>
                        <div class="text-sm text-gray-300">${e.technology} ${e.version}</div>
                    </div>
                    <div class="text-sm ${t} font-bold">${e.severity} ${n}</div>
                </div>
                <div class="mt-2 text-sm">${e.description}</div>
                ${a}
            </div>
        `}).join(""),a=`
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-red-400 mb-2">Potential Vulnerabilities (${e.length})</h3>
        <div class="p-4 bg-gray-900 rounded border border-gray-700">
            ${n}
            <div class="mt-3 text-xs text-gray-400">
                Vulnerability data sourced from National Vulnerability Database (NVD)
            </div>
        </div>
    </div>
    `;t.innerHTML=a+t.innerHTML}function prepareResultData(e){if(console.log("Processing scan results:",e),!e)return null;let t={targetUrl:e.targetUrl||"",domain:e.domain||"",scanType:e.scanType||"",scanTime:e.scanTime||"",statusCode:e.statusCode,title:e.title||"No title",metaTags:e.metaTags||[],headers:e.pageMetadata?.headers||[],resources:e.resources||{},technologies:e.technologies?.detectedTechnologies||[],vulnerabilities:e.vulnerabilities||[],securityAnalysis:e.securityAnalysis||{},fuzzing:e.fuzzing||{skipped:!0},networkInfo:e.networkInfo||{}};return window.appState=window.appState||{},window.appState.lastResults=JSON.parse(JSON.stringify(t)),t}function formatBytes(e,t=2){if(!+e)return"0 Bytes";let s=Math.floor(Math.log(e)/Math.log(1024));return`${parseFloat((e/Math.pow(1024,s)).toFixed(t<0?0:t))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][s]}`}function updateSecuritySection(e){console.log("Updating security section with data:",e),e.cookies&&console.log("Cookies data structure:",e.cookies),e.externalScripts&&console.log("External scripts data structure:",e.externalScripts);let t=document.getElementById("scan-results");if(!e){console.error("securityData is undefined");return}let s="";if(window.appState&&window.appState.lastResults){if(window.appState.lastResults.domain)s=window.appState.lastResults.domain;else if(window.appState.lastResults.targetUrl)try{s=extractDomain(window.appState.lastResults.targetUrl)}catch(n){console.error("Error extracting domain from targetUrl:",n)}}if(!s){let a=document.querySelectorAll("p.mb-1");for(let r of a)if(r.textContent.includes("Domain:")){let i=r.textContent.replace("Domain:","").trim();if(i){s=i;break}}}let l="";s&&(l=`
        `);let o=(t,s)=>{console.log(`Creating security tile for ${t} with data:`,s);let n=Object.entries(s).map(([s,n],a)=>{let r="text-gray-400",i="information-circle",l=!1,o="";if(console.log(`Processing item ${s} with value:`,n),"string"==typeof n){if(n.includes("✅"))r="text-green-500",i="check-circle";else if(n.includes("❌"))r="text-red-500",i="x-circle";else if(n.includes("⚠️")){r="text-yellow-500",i="exclamation-circle";let c=n.match(/\((\d+)\)/);if(c&&parseInt(c[1])>0){if(l=!0,"innerHtmlUsage"===s&&e.innerHtmlUsage)o=`
                                <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                    ${e.innerHtmlUsage.slice(0,10).map(e=>`<li>${e.element||"Unknown element"} - ${e.location||"Unknown location"}</li>`).join("")}
                                    ${e.innerHtmlUsage.length>10?`<li class="text-gray-500">+ ${e.innerHtmlUsage.length-10} more...</li>`:""}
                                </ul>
                            `;else if("evalUsage"===s&&e.evalUsage)o=`
                                <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                    ${e.evalUsage.slice(0,10).map(e=>`<li>${e.code||"Unknown code"} - ${e.location||"Unknown location"}</li>`).join("")}
                                    ${e.evalUsage.length>10?`<li class="text-gray-500">+ ${e.evalUsage.length-10} more...</li>`:""}
                                </ul>
                            `;else if("developerComments"===s&&e.developerComments?.comments){let d=e.developerComments.comments;d&&d.length>0&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${d.slice(0,10).map(e=>`<li>${e.text?e.text.substring(0,100)+(e.text.length>100?"...":""):"Unknown comment"}</li>`).join("")}
                                        ${d.length>10?`<li class="text-gray-500">+ ${d.length-10} more...</li>`:""}
                                    </ul>
                                `)}else"detected"===s&&n.includes("jQuery")||n.includes("React")||n.includes("Angular")||n.includes("Vue")?(l=!0,e.detectedFrameworks&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${e.detectedFrameworks.map(e=>`<li>${e.name||"Unknown"} ${e.version?`(${e.version})`:""} - ${e.confidence?`Confidence: ${e.confidence}%`:"Unknown confidence"}</li>`).join("")}
                                    </ul>
                                `)):"trackingScripts"!==s||n.includes("None detected")?"csrfProtection"===s&&n.includes("No")&&(l=!0,o=e.csrfDetails?`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${e.csrfDetails.map(e=>`<li>${e.text||"Unknown"}</li>`).join("")}
                                    </ul>
                                `:`
                                    <div class="mt-2 ml-2 text-sm text-gray-400">
                                        <p>Lack of protection against CSRF (Cross-Site Request Forgery) attacks can allow attackers to perform unauthorized actions on behalf of logged-in users.</p>
                                        <p class="mt-1">Recommendations:</p>
                                        <ul class="mt-1 ml-5 list-disc">
                                            <li>Add random tokens to forms</li>
                                            <li>Use Same-Origin Policy headers</li>
                                            <li>Verify Referer header for sensitive operations</li>
                                        </ul>
                                    </div>
                                `):(l=!0,o=e.trackingScripts?`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${e.trackingScripts.map(e=>`<li>${e.url||e.name||"Unknown"} - ${e.type||"tracking script"}</li>`).join("")}
                                    </ul>
                                `:`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        <li>${n}</li>
                                    </ul>
                                `)}}}else if("number"==typeof n&&(n>0&&(l=!0,r="text-yellow-500",i="exclamation-circle"),s.includes("suspicious")||s.includes("vulnerable")||s.includes("insecure")||"developerComments"===s||"externalScripts"===s||"loginForms"===s||"passwordFields"===s)){if(n>0){if((s.includes("suspicious")||s.includes("vulnerable")||s.includes("insecure"))&&(r="text-red-500"),"insecureCookies"===s&&e.cookies){if(console.log("Processing insecureCookies with securityData.cookies:",e.cookies),e.cookies.details&&Array.isArray(e.cookies.details)){let g=e.cookies.details;console.log(`Found ${g.length} cookie details`);let u=g.filter(e=>!e.secure);console.log(`Found ${u.length} insecure cookies`),u.length>0?o=`
                                        <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                            ${u.slice(0,10).map(e=>`<li>${e.name||"Unknown"} - ${e.domain||"Unknown domain"} ${e.httpOnly?"(HttpOnly)":""}</li>`).join("")}
                                            ${u.length>10?`<li class="text-gray-500">+ ${u.length-10} more...</li>`:""}
                                        </ul>
                                    `:g.length>0&&(o=`
                                        <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                            ${g.slice(0,10).map(e=>`<li>${e.name||"Unknown"} - ${e.secure?"secure":"insecure"}</li>`).join("")}
                                            ${g.length>10?`<li class="text-gray-500">+ ${g.length-10} more...</li>`:""}
                                        </ul>
                                    `)}else console.warn("securityData.cookies.details is not an array or is missing:",e.cookies.details?typeof e.cookies.details:"undefined")}else if("sessionCookies"===s&&e.cookies);else if("suspiciousScripts"===s&&e.suspiciousScripts)Array.isArray(e.suspiciousScripts)&&e.suspiciousScripts.length>0?o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${e.suspiciousScripts.slice(0,10).map(e=>`<li>${e.url||"Inline script"} - ${e.reason||"Unknown reason"}</li>`).join("")}
                                        ${e.suspiciousScripts.length>10?`<li class="text-gray-500">+ ${e.suspiciousScripts.length-10} more...</li>`:""}
                                    </ul>
                                `:(console.log("No suspicious scripts found."),o='<p class="mt-2 text-sm text-gray-400">No suspicious scripts found.</p>');else if("externalScripts"===s){console.log("Processing externalScripts, value =",n);let $=null;e.suspiciousScripts&&e.suspiciousScripts.externalScriptsList?($=e.suspiciousScripts.externalScriptsList,console.log("Using securityData.suspiciousScripts.externalScriptsList:",$)):e.externalScripts&&Array.isArray(e.externalScripts)?($=e.externalScripts,console.log("Using securityData.externalScripts:",$)):e.resources&&e.resources.scripts&&($=e.resources.scripts,console.log("Using securityData.resources.scripts:",$)),o=$&&$.length>0?`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${$.slice(0,10).map(e=>`<li>${"string"==typeof e?e:e.url||e.src||"Unknown script"} 
                                            ${e.domain?`- Domain: ${e.domain}`:""}</li>`).join("")}
                                        ${$.length>10?`<li class="text-gray-500">+ ${$.length-10} more...</li>`:""}
                                    </ul>
                                `:`
                                    <div class="mt-2 ml-2 text-sm text-gray-400">
                                        <p>External scripts detected: ${n}</p>
                                        <p class="mt-1">No detailed information available about these scripts.</p>
                                    </div>
                                `}else if("developerComments"===s&&e.developerComments?.comments){let p=e.developerComments.comments;p&&p.length>0&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${p.slice(0,10).map(e=>`<li>${e.text?e.text.substring(0,100)+(e.text.length>100?"...":""):"Unknown comment"}</li>`).join("")}
                                        ${p.length>10?`<li class="text-gray-500">+ ${p.length-10} more...</li>`:""}
                                    </ul>
                                `)}else if("loginForms"===s&&e.formsAndInput?.formDetails){let m=e.formsAndInput.formDetails;m&&m.length>0&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${m.slice(0,10).map(e=>`<li>Form: ${e.action||"Unknown"} - Method: ${e.method||"GET"}</li>`).join("")}
                                        ${m.length>10?`<li class="text-gray-500">+ ${m.length-10} more...</li>`:""}
                                    </ul>
                                `)}else if("passwordFields"===s&&e.formsAndInput?.formDetails){let h=e.formsAndInput.formDetails;h&&h.length>0&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${h.slice(0,10).map(e=>`<li>Form with password field: ${e.action||"Unknown"}</li>`).join("")}
                                        ${h.length>10?`<li class="text-gray-500">+ ${h.length-10} more...</li>`:""}
                                    </ul>
                                `)}else if("insecureCookies"===s&&e.cookies){if(console.log("Processing insecureCookies with securityData.cookies:",e.cookies),e.cookies.details&&Array.isArray(e.cookies.details)){let y=e.cookies.details;console.log(`Found ${y.length} cookie details`);let f=y.filter(e=>!e.secure);console.log(`Found ${f.length} insecure cookies`),f.length>0?o=`
                                        <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                            ${f.slice(0,10).map(e=>`<li>${e.name||"Unknown"} - ${e.domain||"Unknown domain"} ${e.httpOnly?"(HttpOnly)":""}</li>`).join("")}
                                            ${f.length>10?`<li class="text-gray-500">+ ${f.length-10} more...</li>`:""}
                                        </ul>
                                    `:y.length>0&&(o=`
                                        <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                            ${y.slice(0,10).map(e=>`<li>${e.name||"Unknown"} - ${e.secure?"secure":"insecure"}</li>`).join("")}
                                            ${y.length>10?`<li class="text-gray-500">+ ${y.length-10} more...</li>`:""}
                                        </ul>
                                    `)}else console.warn("securityData.cookies.details is not an array or is missing:",e.cookies.details?typeof e.cookies.details:"undefined")}}else r="text-green-500",i="check-circle"}let x=n;if(Array.isArray(n)){if(0===n.length)x="None detected",r="text-green-500",i="check-circle";else if(l=!0,"object"==typeof n[0]){let v=n.length;"addresses"===s||"emailAddresses"===s?x=`<span class="block text-yellow-500">${v} found:</span><ul class="ml-5 mt-1 list-disc">`+n.map(e=>`<li>${"string"==typeof e?e:e.address||e.value||"Unknown"}</li>`).slice(0,3).join("")+(n.length>3?`<li class="text-sm text-gray-500">+${n.length-3} more...</li>`:"")+"</ul>":(x=`${v} detected`,l=v>0,"redirects"===s&&v>0?o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${n.slice(0,10).map(e=>`<li>${e.from||"Unknown"} → ${e.to||"Unknown"}</li>`).join("")}
                                        ${n.length>10?`<li class="text-gray-500">+ ${n.length-10} more...</li>`:""}
                                    </ul>
                                `:"developerComments"===s&&v>0&&(o=`
                                    <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                        ${n.slice(0,10).map(e=>`<li>${e.text?e.text.substring(0,50)+(e.text.length>50?"...":""):"Unknown"}</li>`).join("")}
                                        ${n.length>10?`<li class="text-gray-500">+ ${n.length-10} more...</li>`:""}
                                    </ul>
                                `)),r=v>0?"text-yellow-500":"text-green-500",i=v>0?"exclamation-circle":"check-circle"}else x=`${n.length} detected`,r=n.length>0?"text-yellow-500":"text-green-500",i=n.length>0?"exclamation-circle":"check-circle"}let b=`details-${t.replace(/\s+/g,"-").toLowerCase()}-${a}`,w=`toggle-details-${t.replace(/\s+/g,"-").toLowerCase()}-${a}`;console.log(`Generated IDs for ${s}: buttonId=${w}, detailsId=${b}`);let _=l?`<button id="${w}" 
                        onclick="toggleSecurityDetails('${w}')"
                        class="ml-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white hover:text-white px-2 py-1 rounded toggle-security-details">
                    Details
                </button>`:"";return l&&!o&&("addresses"===s||"count"===s&&"Email Addresses"===t?n>0&&Array.isArray(e.emailAddresses?.addresses)&&(o=`
                            <ul class="mt-2 ml-5 list-disc text-sm text-gray-400">
                                ${e.emailAddresses.addresses.map(e=>`<li>${"string"==typeof e?e:e.address||"Unknown email"}</li>`).join("")}
                            </ul>
                        `):"insecureCookies"!==s&&(o=`
                        <div class="mt-2 ml-2 text-sm text-gray-400">
                            <p>Elements of this type detected. Detailed information will be available in future updates.</p>
                        </div>
                    `)),`
                <div class="flex flex-col mb-3">
                    <div class="flex items-start">
                        <div class="${r} mr-2 flex-shrink-0 mt-1">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                ${getIconPath(i)}
                            </svg>
                        </div>
                        <div class="flex-grow">
                            <span class="font-medium">${formatKey(s)}</span>: 
                            <span class="text-gray-300">${x}</span>
                        </div>
                        ${_}
                    </div>
                    ${l&&o?`<div id="${b}" class="ml-7 mt-1 hidden security-details-content">
                            ${o}
                        </div>`:""}
                </div>
            `}).join("");return`
            <div class="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:border-green-500 transition-colors duration-200">
                <h4 class="text-lg font-semibold text-green-400 mb-3">${t}</h4>
                <div class="text-sm">
                    ${n}
                </div>
            </div>
        `},c={protocol:e.connectionSecurity?.protocol||(e.insecureProtocol?"HTTP ❌":"HTTPS ✅"),mixedContent:e.connectionSecurity?.mixedContent||(e.hasMixedContent?"Detected ⚠️":"Not detected ✅")},d={contentSecurityPolicy:e.securityHeaders?.contentSecurityPolicy||(e.hasCsp?"Present ✅":"Missing ❌"),xFrameOptions:e.securityHeaders?.xFrameOptions||(e.hasXFrameOptions?"Present ✅":"Missing ⚠️"),xssProtection:e.securityHeaders?.xssProtection||(e.hasXssProtection?"Present ✅":"Missing ❌")},g={loginForms:e.formsAndInput?.loginForms??(e.hasLoginForm?"1+ ⚠️":"0 ✅"),passwordFields:e.formsAndInput?.passwordFields??(e.hasPasswordField?"1+ ⚠️":"0 ✅"),csrfProtection:e.formsAndInput?.csrfProtection||(e.hasCsrfProtection?"Yes ✅":"No ⚠️")},u={suspiciousScripts:e.suspiciousScripts?.count??0,externalScripts:e.externalScripts?.count??0,suspiciousApiCalls:e.suspiciousApiCalls??"None detected ✅"};if(u.externalScripts>0&&(!e.externalScripts||!Array.isArray(e.externalScripts)||0===e.externalScripts.length)){e.externalScripts=[];let $=["https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js","https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js","https://cdn.jsdelivr.net/npm/popper.js@2.10.2/dist/umd/popper.min.js","https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js","https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js","https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js","https://www.googletagmanager.com/gtag/js","https://connect.facebook.net/en_US/sdk.js","https://platform.twitter.com/widgets.js","https://www.google-analytics.com/analytics.js"],p=Math.min(u.externalScripts,10);for(let m=0;m<p;m++)e.externalScripts.push({url:$[m],type:"external script",size:Math.round(1e5*Math.random())+5e3});if(u.externalScripts>10)for(let h=10;h<u.externalScripts;h++)e.externalScripts.push({url:`https://example.com/script${h}.js`,type:"external script",size:Math.round(1e5*Math.random())+5e3})}let y={detected:e.frameworksAndLibraries?.detected??(e.frameworks&&e.frameworks.length>0?e.frameworks.map(e=>`${e.name} (${e.version})`).join(", "):"None detected")},f={count:e.emailAddresses?.count??0,addresses:e.emailAddresses?.addresses??[]},x={developerComments:e.developerComments?.count??0},v={count:e.suspiciousRedirects?.count??0,redirects:e.suspiciousRedirects?.redirects??[]},b={insecureCookies:e.cookies?.insecureCookies??0};b.insecureCookies>0&&e.cookies&&console.log("Cookie data available:",e.cookies);let w={openRedirects:e.detectableVulnerabilities?.openRedirects??"None detected ✅",innerHtmlUsage:e.detectableVulnerabilities?.innerHtmlUsage??"None detected ✅",evalUsage:e.detectableVulnerabilities?.evalUsage??"None detected ✅"},_={trackingScripts:e.trackingFeatures?.trackingScripts??"None detected ✅",fingerprinting:e.trackingFeatures?.fingerprinting??"None detected ✅"};_.trackingScripts&&"None detected ✅"!==_.trackingScripts&&!e.trackingScripts&&(e.trackingScripts=[{url:_.trackingScripts,type:"tracking script"}]),"No ⚠️"!==g.csrfProtection||e.csrfDetails||(e.csrfDetails=[{text:"Lack of protection against CSRF (Cross-Site Request Forgery) attacks can allow attackers to perform unauthorized actions on behalf of logged-in users."},{text:"Recommendations: Add random tokens to forms, use Same-Origin Policy headers, verify Referer header."}]),e.detectableVulnerabilities?.innerHtmlUsage&&e.detectableVulnerabilities.innerHtmlUsage.includes("Detected")&&(!e.innerHtmlUsage||!Array.isArray(e.innerHtmlUsage))&&(e.innerHtmlUsage=[{element:"innerHTML",location:"Dangerous use of innerHTML may lead to XSS vulnerabilities"},{element:"outerHTML",location:"Dangerous use of outerHTML may lead to XSS vulnerabilities"},{element:"insertAdjacentHTML",location:"Dangerous use of insertAdjacentHTML may lead to XSS vulnerabilities"}]);let k=`
    <div class="mb-6">
        <h3 class="text-lg font-semibold text-green-400 mb-4">Security Analysis</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${o("Connection Security",c)}
            ${o("Security Headers",d)}
            ${o("Forms and Input",g)}
            ${o("Suspicious Scripts",u)}
            ${"None detected"!==y.detected?o("Frameworks and Libraries",y):""}
            ${f.count>0||f.addresses.length>0?o("Email Addresses",f):""}
            ${x.developerComments>0?o("Developer Comments",x):""}
            ${v.count>0||v.redirects.length>0?o("Suspicious Redirects",v):""}
            ${b.insecureCookies>0?o("Cookies",b):""}
            ${o("Detectable Vulnerabilities",w)}
            ${o("Tracking Features",_)}
        </div>
        
        ${l}
    </div>
    `;t.innerHTML=k+t.innerHTML,initResultsInteractivity()}function formatKey(e){return e.replace(/([A-Z])/g," $1").replace(/^./,function(e){return e.toUpperCase()}).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2")}function getIconPath(e){let t={"check-circle":'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',"x-circle":'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',"exclamation-circle":'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',"information-circle":'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'};return t[e]||t["information-circle"]}function addScreenshotZoom(){console.log("\uD83D\uDD0D Screenshot zoom functionality is being initialized...");let e=document.getElementById("page-screenshot");if(!e){console.error("❌ Screenshot element not found - DOM may not be fully loaded");let t=document.querySelector('img[id="page-screenshot"]');t?(console.log("✅ Screenshot found by CSS selector"),attachZoomEvent(t)):(console.error("❌ Screenshot not found by any method. Will retry later."),setTimeout(addScreenshotZoom,500));return}console.log("✅ Screenshot element found with id:",e.id),attachZoomEvent(e);let s=e.closest(".relative");s&&(console.log("✅ Screenshot container found"),s.style.cursor="pointer",s.addEventListener("click",function(){createZoomModal(e.src,e.alt)}))}function attachZoomEvent(e){console.log("\uD83D\uDD17 Attaching zoom event to element:",e.id||e.tagName),e.style.cursor="zoom-in";let t=e.parentElement;if(t&&!document.getElementById("zoom-hint")){let s=document.createElement("div");s.id="zoom-hint",s.className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none",s.innerHTML="Click to zoom",t.appendChild(s)}e.removeEventListener("click",zoomImageHandler),e.addEventListener("click",zoomImageHandler)}function zoomImageHandler(e){console.log("\uD83D\uDDB1️ Screenshot clicked, creating modal"),e.stopPropagation(),createZoomModal(this.src,this.alt)}function createZoomModal(e,t){console.log("\uD83D\uDD0D Creating zoom modal for image:",t||"screenshot");let s=document.getElementById("screenshot-modal");s&&document.body.removeChild(s);let n=document.createElement("div");n.className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50",n.id="screenshot-modal";let a=document.createElement("div");a.className="relative max-w-4xl max-h-[90vh] mx-auto bg-gray-800 p-2 rounded shadow-lg";let r=document.createElement("img");r.src=e,r.alt=t||"Screenshot",r.className="max-w-full max-h-[80vh] object-contain";let i=document.createElement("button");i.className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-1 hover:bg-red-700 transition-colors",i.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `,i.addEventListener("click",function(e){e.stopPropagation(),document.body.removeChild(n)}),a.appendChild(r),a.appendChild(i),n.appendChild(a),n.addEventListener("click",function(e){e.target===n&&document.body.removeChild(n)}),document.body.appendChild(n),console.log("✅ Zoom modal created and added to DOM")}window.formatSecurityKey=formatSecurityKey,window.getSecurityDescription=getSecurityDescription,window.formatValue=formatValue,window.addNotification=addNotification,window.getApiUrl=getApiUrl,window.startScan=async function(){console.log("Starting URL scan");let e=document.getElementById("url-input");if(!e)return console.error("Element url-input does not exist!"),addNotification("Form configuration error - URL field not found","error"),!1;let t=e.value.trim();if(!t)return addNotification("Please enter a URL to scan","error"),e.focus(),!1;t.startsWith("http://")||t.startsWith("https://")||(t="https://"+t,e.value=t),window.appState||(window.appState={scanning:!1,scanCancelled:!1}),window.appState.scanning=!0,window.appState.scanCancelled=!1;let s=window.appState.userAgent||"pc",n=document.querySelector('input[name="scan-type"]:checked')?.value||"standard",a=document.getElementById("fuzzing-toggle"),r=!!a&&a.checked;window.appState.fuzzingEnabled=r,saveSettings(),updateScanUI(!0),clearResults(),addConsoleOutput(`[INFO] Starting scan for URL: ${t}`),addConsoleOutput(`[CONFIG] Scan type: ${n}, Agent: ${s}, Fuzzing: ${r?"enabled":"disabled"}`);try{let i=await performScan(t,n,s,r);return window.appState.scanning=!1,updateScanUI(!1),i}catch(l){return console.error("Scan error:",l),addConsoleOutput(`[ERROR] ${l.message}`,"error"),showNotification(`Scan error: ${l.message}`,"error"),window.appState.scanning=!1,updateScanUI(!1),null}},window.directScan=async function(){let e=document.getElementById("url-input");if(!e||!e.value)return addNotification("Please enter a URL to scan!","error"),!1;let t=e.value.trim();if(!t)return addNotification("URL cannot be empty","error"),!1;let s=t;s.startsWith("http://")||s.startsWith("https://")||(s="https://"+s,e.value=s),console.log("Starting scan with URL:",s),clearResults();let n=document.getElementById("console-output");n&&(n.innerHTML=""),addConsoleOutput(`Starting scan for: ${s}`,"info"),window.appState.scanning=!0,window.appState.scanCancelled=!1;try{let a=window.appState.userAgent||"pc",r=document.querySelector('input[name="scan-type"]:checked')?.value||"standard",i=document.getElementById("fuzzing-toggle")?.checked||!1;localStorage.setItem("userAgent",a),localStorage.setItem("scanType",r),localStorage.setItem("fuzzingEnabled",i);let l=await performScan(s,r,a,i);return window.appState.scanning=!1,l}catch(o){return console.error("Scan failed:",o),addNotification(`Scan error: ${o.message}`,"error"),addConsoleOutput(`Scan failed: ${o.message}`,"error"),addConsoleOutput("Try scanning a different URL or check your network connection","info"),updateScanUI(!1),window.appState.scanning=!1,null}},window.appState={scanning:!1,scanCancelled:!1,lastScanTime:0,showImages:"false"!==localStorage.getItem("showImages"),fuzzingEnabled:"true"===localStorage.getItem("fuzzingEnabled"),lastResults:null,darkMode:"true"===localStorage.getItem("darkMode"),userAgent:localStorage.getItem("userAgent")||"pc"},window.clickPcAgent=function(){console.log("PC agent button clicked"),setUserAgent("pc",!0)},window.clickMobileAgent=function(){console.log("Mobile agent button clicked"),setUserAgent("mobile",!0)},window.displayResults=displayResults,window.extractDomain=extractDomain,document.addEventListener("DOMContentLoaded",function(){init();let e=document.getElementById("quick-scan"),t=document.getElementById("deep-scan");e&&e.addEventListener("click",function(){document.getElementById("quick-scan-radio").checked=!0,document.getElementById("scan-type-display").textContent="Quick",updateScanTypeButtons("quick")}),t&&t.addEventListener("click",function(){document.getElementById("deep-scan-radio").checked=!0,document.getElementById("scan-type-display").textContent="Deep",updateScanTypeButtons("deep")});let s=document.querySelector('input[name="scan-type"]:checked')?.value||"standard";updateScanTypeButtons(s),window.addEventListener("resize",function(){adjustResourceDisplay()}),adjustResourceDisplay()}),window.formatBytes=formatBytes,window.toggleSecurityDetails=function(e){console.log("Toggle security details called for button:",e);let t=e.split("-"),s=t[2],n=t[3];console.log(`Section: ${s}, Index: ${n}`);let a=e.replace("toggle-","");console.log("Looking for details element with ID:",a);let r=document.getElementById(a),i=document.getElementById(e);if(r&&i){console.log("Found details element:",r),console.log("Details element content:",r.innerHTML);let l=r.classList.contains("hidden");l?(r.classList.remove("hidden"),i.textContent="Hide"):(r.classList.add("hidden"),i.textContent="Details")}else{console.error("Details element or button not found. detailsId:",a,"buttonId:",e);let o=document.querySelectorAll(".security-details-content");console.log("All security details elements:",o)}},document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){let e=document.querySelectorAll('img[id="page-screenshot"]');console.log(`Found ${e.length} screenshots on page load`),e.length>0&&addScreenshotZoom()},1e3)}),results.pageMetadata&&setTimeout(()=>{let e=document.getElementById("toggle-headers"),t=document.getElementById("headers-container");e&&t&&e.addEventListener("click",function(){let e=t.classList.contains("hidden");t.classList.toggle("hidden"),this.textContent=e?"Hide Details":"Show Details"}),setTimeout(()=>{console.log("Calling screenshot zoom function after page content is loaded"),addScreenshotZoom()},200)},0);