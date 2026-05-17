// Initialize PostHog (Placeholders)
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

// Replace these placeholders with your actual Project API Key and Host!
posthog.init('phc_kk9NCvkgitYTFXe6XuXemU2atLznTa7EVhU6KDFmWB6h', {api_host: 'https://us.i.posthog.com'});

// Track Download Button Clicks
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtns = document.querySelectorAll('.btn-primary');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            posthog.capture('download_clicked', {
                location: window.location.pathname
            });
        });
    });
});

async function downloadLatestRelease() {
    try {
        const response = await fetch('https://api.github.com/repos/adityadivatee/DV-PD/releases/latest');
        const data = await response.json();
        const exeAsset = data.assets.find(asset => asset.name.endsWith('.exe'));
        if (exeAsset) {
            window.location.href = exeAsset.browser_download_url;
        } else {
            window.location.href = 'https://github.com/adityadivatee/DV-PD/releases/latest';
        }
    } catch (e) {
        window.location.href = 'https://github.com/adityadivatee/DV-PD/releases/latest';
    }
}
