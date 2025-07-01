<script>
/**
 * US National Debt Widget - FIXED VERSION
 * Version: 1.7.0
 * 
 * FIXES:
 * - Added CORS handling
 * - Added better error handling with fallbacks
 * - Updated API approach
 * - Added retry mechanism
 * - Improved field name handling
 */

// Configuration Object - Edit these settings to customize the widget
const DebtWidgetConfig = {
    // API settings
    api: {
        // Primary API endpoint
        url: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny',
        // Backup JSONP endpoint (if available)
        jsonpUrl: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny',
        params: {
            sort: '-record_date',  // Sort by date descending (newest first)
            pageSize: 1,           // Just get the latest data
            format: 'json'         // Response format
        },
        // Retry settings
        maxRetries: 3,
        retryDelay: 1000
    },
    
    // Animation settings
    animation: {
        enabled: true,               // Enable/disable the counting animation
        duration: 2000,              // Duration of animation in milliseconds (reduced for better UX)
        reductionPercentage: 0.1,    // Start animation from X% less than actual value
        easing: 'easeOutExpo'        // Animation easing function
    },
    
    // Display settings
    display: {
        showSymbol: true,           // Show $ symbol
        useCommas: true,            // Format numbers with commas
        abbreviateTrillions: false, // Display as $XX.XX trillion instead of full number
        roundToInteger: true,       // Remove cents display
        fixedDigitWidth: true       // Use fixed-width digit containers for anti-jiggle
    },
    
    // Refresh settings
    refresh: {
        autoRefresh: true,         // Automatically refresh data
        interval: 3600000          // Refresh interval in milliseconds (1 hour)
    },
    
    // Fallback data (in case API is unavailable)
    fallback: {
        debtAmount: 36213561491981.97,  // Updated fallback amount
        lastUpdated: '2025-06-27'       // Last known update date
    }
};

// Easing functions for animation
const EasingFunctions = {
    linear: t => t,
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    elastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
};

// Format a number with fixed-width digit containers
function formatNumberWithFixedWidth(number) {
    let formatted = '';
    
    if (DebtWidgetConfig.display.abbreviateTrillions && number >= 1000000000000) {
        const trillions = number / 1000000000000;
        formatted = trillions.toFixed(2) + 'T';
    } else {
        let numStr = DebtWidgetConfig.display.roundToInteger ? 
            Math.floor(number).toString() : 
            number.toString();
        
        if (DebtWidgetConfig.display.useCommas) {
            numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        if (DebtWidgetConfig.display.fixedDigitWidth) {
            formatted = '';
            for (let i = 0; i < numStr.length; i++) {
                const char = numStr[i];
                if (/\d/.test(char)) {
                    formatted += `<span class="digit-container">${char}</span>`;
                } else if (char === ',') {
                    formatted += `<span class="digit-container comma">${char}</span>`;
                } else {
                    formatted += char;
                }
            }
        } else {
            formatted = numStr;
        }
    }
    
    if (DebtWidgetConfig.display.showSymbol) {
        if (DebtWidgetConfig.display.fixedDigitWidth) {
            formatted = `<span class="currency-symbol">$</span>${formatted}`;
        } else {
            formatted = '$' + formatted;
        }
    }
    
    return formatted;
}

// Original format function (for non-HTML use cases)
function formatNumber(number) {
    let formatted = '';
    
    if (DebtWidgetConfig.display.abbreviateTrillions && number >= 1000000000000) {
        const trillions = number / 1000000000000;
        formatted = trillions.toFixed(2) + 'T';
    } else {
        if (DebtWidgetConfig.display.useCommas) {
            formatted = DebtWidgetConfig.display.roundToInteger ? 
                Math.floor(number).toLocaleString('en-US') : 
                number.toLocaleString('en-US');
        } else {
            formatted = DebtWidgetConfig.display.roundToInteger ? 
                Math.floor(number).toString() : 
                number.toString();
        }
    }
    
    if (DebtWidgetConfig.display.showSymbol) {
        formatted = '$' + formatted;
    }
    
    return formatted;
}

// Get current date formatted as "Month Day, Year"
function getCurrentDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Animate counting from start to end value
function animateCount(startValue, endValue, element) {
    if (!element || !DebtWidgetConfig.animation.enabled) {
        if (element) {
            if (DebtWidgetConfig.display.fixedDigitWidth) {
                element.innerHTML = formatNumberWithFixedWidth(endValue);
            } else {
                element.textContent = formatNumber(endValue);
            }
        }
        return;
    }
    
    if (window.debtAnimationFrame) {
        cancelAnimationFrame(window.debtAnimationFrame);
    }
    
    const duration = DebtWidgetConfig.animation.duration;
    const easingFn = EasingFunctions[DebtWidgetConfig.animation.easing] || EasingFunctions.linear;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);
        
        const currentValue = startValue + (endValue - startValue) * easedProgress;
        
        if (DebtWidgetConfig.display.fixedDigitWidth) {
            element.innerHTML = formatNumberWithFixedWidth(currentValue);
        } else {
            element.textContent = formatNumber(currentValue);
        }
        
        if (progress < 1) {
            window.debtAnimationFrame = requestAnimationFrame(animate);
        }
    };
    
    window.debtAnimationFrame = requestAnimationFrame(animate);
}

// Build the API URL with parameters
function buildApiUrl() {
    const url = new URL(DebtWidgetConfig.api.url);
    const params = DebtWidgetConfig.api.params;
    
    Object.keys(params).forEach(key => {
        if (key === 'pageSize') {
            url.searchParams.append('page[size]', params[key]);
        } else {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return url.toString();
}

// Sleep function for retry delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced fetch with CORS handling and retries
async function fetchWithRetry(url, options = {}, retryCount = 0) {
    try {
        // Try with CORS mode first
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.warn(`Fetch attempt ${retryCount + 1} failed:`, error.message);
        
        // If we have retries left, try again
        if (retryCount < DebtWidgetConfig.api.maxRetries) {
            await sleep(DebtWidgetConfig.api.retryDelay * (retryCount + 1));
            return fetchWithRetry(url, options, retryCount + 1);
        }
        
        // If all retries failed, try no-cors mode as last resort
        if (retryCount === DebtWidgetConfig.api.maxRetries) {
            try {
                console.log('Trying no-cors mode as fallback...');
                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    ...options
                });
                // Note: no-cors mode won't give us the actual data, so this will likely fail
                return await response.json();
            } catch (noCorsError) {
                console.warn('No-cors fallback also failed:', noCorsError.message);
            }
        }
        
        throw error;
    }
}

// Try alternative data sources
async function tryAlternativeSource() {
    // You could add alternative API endpoints here
    // For now, we'll use the fallback data
    console.log('Using fallback data source...');
    return {
        data: [{
            tot_pub_debt_out_amt: DebtWidgetConfig.fallback.debtAmount.toString(),
            record_date: DebtWidgetConfig.fallback.lastUpdated
        }]
    };
}

// Main function to fetch debt data
async function fetchDebtData() {
    const debtElement = document.getElementById('debt-amount');
    const dateElement = document.getElementById('last-updated-date');
    
    if (!debtElement) {
        console.error('Debt amount element not found');
        return;
    }
    
    try {
        console.log('Fetching debt data...');
        const apiUrl = buildApiUrl();
        console.log('API URL:', apiUrl);
        
        let data;
        
        try {
            // Try the main API first
            data = await fetchWithRetry(apiUrl);
        } catch (apiError) {
            console.warn('Main API failed, trying alternative source:', apiError.message);
            // Try alternative source (fallback data)
            data = await tryAlternativeSource();
        }
        
        // Process the data
        if (data && data.data && data.data.length > 0) {
            const latest = data.data[0];
            console.log('Latest record received:', latest);
            
            // Try multiple possible field names for the debt amount
            const possibleFieldNames = [
                'tot_pub_debt_out_amt',
                'total_pub_debt_out_amt', 
                'debt_held_by_public_amt',
                'total_debt',
                'debt_amount'
            ];
            
            let debtAmount = null;
            let fieldUsed = null;
            
            for (const fieldName of possibleFieldNames) {
                if (latest[fieldName] !== undefined && latest[fieldName] !== null) {
                    debtAmount = parseFloat(latest[fieldName]);
                    fieldUsed = fieldName;
                    break;
                }
            }
            
            if (debtAmount && !isNaN(debtAmount)) {
                console.log(`Debt amount found using field "${fieldUsed}":`, debtAmount);
                
                // Update debt amount with animation
                const startValue = debtAmount * (1 - DebtWidgetConfig.animation.reductionPercentage);
                animateCount(startValue, debtAmount, debtElement);
                
                // Update date
                if (dateElement) {
                    if (latest.record_date) {
                        const recordDate = new Date(latest.record_date);
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        dateElement.textContent = `Updated: ${recordDate.toLocaleDateString('en-US', options)}`;
                    } else {
                        dateElement.textContent = `Updated: ${getCurrentDate()}`;
                    }
                }
                
                console.log('Debt widget updated successfully');
                
            } else {
                throw new Error('No valid debt amount found in response');
            }
            
        } else {
            throw new Error('No data found in API response');
        }
        
    } catch (error) {
        console.error('Error fetching debt data:', error);
        
        // Use fallback data
        console.log('Using fallback data due to error');
        const fallbackAmount = DebtWidgetConfig.fallback.debtAmount;
        const startValue = fallbackAmount * (1 - DebtWidgetConfig.animation.reductionPercentage);
        
        if (debtElement) {
            animateCount(startValue, fallbackAmount, debtElement);
        }
        
        if (dateElement) {
            const fallbackDate = new Date(DebtWidgetConfig.fallback.lastUpdated);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = `Updated: ${fallbackDate.toLocaleDateString('en-US', options)} (Estimated)`;
        }
    }
}

// Initialize the widget
function initDebtWidget() {
    console.log('Initializing US National Debt Widget v1.7.0...');
    
    const debtElement = document.getElementById('debt-amount');
    
    if (debtElement) {
        console.log('Debt widget elements found, fetching data...');
        fetchDebtData();
        
        // Set up auto-refresh if enabled
        if (DebtWidgetConfig.refresh.autoRefresh) {
            setInterval(fetchDebtData, DebtWidgetConfig.refresh.interval);
            console.log(`Auto-refresh enabled: every ${DebtWidgetConfig.refresh.interval / 1000 / 60} minutes`);
        }
    } else {
        console.error('Widget elements not found. Make sure the HTML is added to the page.');
    }
}

// Enhanced initialization with multiple fallback methods
function initializeWidget() {
    // Method 1: If DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebtWidget);
    } else {
        // Method 2: DOM already loaded, init immediately
        initDebtWidget();
    }
    
    // Method 3: Backup initialization after delay
    setTimeout(() => {
        const debtElement = document.getElementById('debt-amount');
        if (debtElement && (debtElement.textContent === 'Loading...' || debtElement.textContent.trim() === '')) {
            console.log('Backup initialization triggered');
            initDebtWidget();
        }
    }, 3000);
}

// Start the widget
initializeWidget();

// Expose a manual refresh function for debugging
window.refreshDebtWidget = function() {
    console.log('Manual refresh triggered');
    fetchDebtData();
};

// Expose configuration for external modification
window.DebtWidgetConfig = DebtWidgetConfig;
</script>
