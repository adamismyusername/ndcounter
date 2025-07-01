/**
 * US National Debt Widget - Clean Implementation
 * Version: 1.0.2
 * Repository: https://github.com/adamismyusername/ndcounter
 * Documentation: https://github.com/adamismyusername/ndcounter/wiki
 * 
 * NEW in v1.0.2:
 * - Enhanced CSS override support
 * - Clean, focused implementation
 * - Improved error messages
 * - Optimized performance
 */

(function() {
    'use strict';
    
    // Configuration Object - Edit these settings to customize the widget
    const DebtWidgetConfig = {
        // API settings
        api: {
            url: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny',
            params: {
                sort: '-record_date',  // Sort by date descending (newest first)
                pageSize: 1,           // Just get the latest data
                format: 'json'         // Response format
            },
            maxRetries: 3,
            retryDelay: 1000
        },
        
        // Animation settings
        animation: {
            enabled: true,               // Enable/disable the counting animation
            duration: 2000,              // Duration of animation in milliseconds
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
        
        // Fallback data (updated from latest API response)
        fallback: {
            debtAmount: 36215124313382.16,  // Latest known amount from API
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

    // Get widget elements using standard ID selectors
    function getWidgetElements() {
        return {
            container: document.getElementById('debt-widget-container'),
            debtAmount: document.getElementById('debt-amount'),
            dateElement: document.getElementById('last-updated-date'),
            sourceElement: document.getElementById('data-source'),
            infoContainer: document.querySelector('.widget-info')
        };
    }

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
            console.warn(`[DebtWidget] Fetch attempt ${retryCount + 1} failed:`, error.message);
            
            // If we have retries left, try again
            if (retryCount < DebtWidgetConfig.api.maxRetries) {
                await sleep(DebtWidgetConfig.api.retryDelay * (retryCount + 1));
                return fetchWithRetry(url, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    // Main function to fetch debt data
    async function fetchDebtData() {
        const elements = getWidgetElements();
        
        if (!elements.debtAmount) {
            console.error('[DebtWidget] Debt amount element (#debt-amount) not found. Please check your HTML structure.');
            return;
        }
        
        try {
            console.log('[DebtWidget] Fetching debt data...');
            const apiUrl = buildApiUrl();
            console.log('[DebtWidget] API URL:', apiUrl);
            
            const data = await fetchWithRetry(apiUrl);
            
            // Process the data
            if (data && data.data && data.data.length > 0) {
                const latest = data.data[0];
                console.log('[DebtWidget] Latest record received:', latest);
                
                // The correct field name from the API is 'tot_pub_debt_out_amt'
                let debtAmount = null;
                
                if (latest.tot_pub_debt_out_amt !== undefined && latest.tot_pub_debt_out_amt !== null) {
                    debtAmount = parseFloat(latest.tot_pub_debt_out_amt);
                }
                
                if (debtAmount && !isNaN(debtAmount)) {
                    console.log(`[DebtWidget] Debt amount found:`, debtAmount);
                    
                    // Update debt amount with animation
                    const startValue = debtAmount * (1 - DebtWidgetConfig.animation.reductionPercentage);
                    animateCount(startValue, debtAmount, elements.debtAmount);
                    
                    // Update date
                    if (elements.dateElement) {
                        if (latest.record_date) {
                            const recordDate = new Date(latest.record_date);
                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            elements.dateElement.textContent = `Updated: ${recordDate.toLocaleDateString('en-US', options)}`;
                        } else {
                            elements.dateElement.textContent = `Updated: ${getCurrentDate()}`;
                        }
                    }
                    
                    console.log('[DebtWidget] ✅ Widget updated successfully with live data');
                    
                } else {
                    throw new Error('No valid debt amount found in response');
                }
                
            } else {
                throw new Error('No data found in API response');
            }
            
        } catch (error) {
            console.warn('[DebtWidget] API error, using fallback data:', error.message);
            
            // Use fallback data
            console.log('[DebtWidget] Using fallback data');
            const fallbackAmount = DebtWidgetConfig.fallback.debtAmount;
            const startValue = fallbackAmount * (1 - DebtWidgetConfig.animation.reductionPercentage);
            
            if (elements.debtAmount) {
                animateCount(startValue, fallbackAmount, elements.debtAmount);
            }
            
            if (elements.dateElement) {
                const fallbackDate = new Date(DebtWidgetConfig.fallback.lastUpdated);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                elements.dateElement.textContent = `Updated: ${fallbackDate.toLocaleDateString('en-US', options)} (Estimated)`;
            }
            
            console.log('[DebtWidget] ✅ Fallback data loaded successfully');
        }
    }

    // Initialize the widget
    function initDebtWidget() {
        console.log('[DebtWidget] 🚀 Initializing US National Debt Widget v1.0.2...');
        
        const elements = getWidgetElements();
        
        if (elements.debtAmount) {
            console.log('[DebtWidget] Widget elements found, fetching data...');
            console.log('[DebtWidget] Found elements:', {
                container: !!elements.container,
                debtAmount: !!elements.debtAmount,
                dateElement: !!elements.dateElement,
                sourceElement: !!elements.sourceElement,
                infoContainer: !!elements.infoContainer
            });
            
            fetchDebtData();
            
            // Set up auto-refresh if enabled
            if (DebtWidgetConfig.refresh.autoRefresh) {
                setInterval(fetchDebtData, DebtWidgetConfig.refresh.interval);
                console.log(`[DebtWidget] Auto-refresh enabled: every ${DebtWidgetConfig.refresh.interval / 1000 / 60} minutes`);
            }
        } else {
            console.error('[DebtWidget] Widget elements not found. Please check your HTML structure.');
            console.error('[DebtWidget] Required: #debt-widget-container, #debt-amount, #last-updated-date, #data-source');
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
            const elements = getWidgetElements();
            if (elements.debtAmount && (elements.debtAmount.textContent === 'Loading...' || elements.debtAmount.textContent.trim() === '')) {
                console.log('[DebtWidget] Backup initialization triggered');
                initDebtWidget();
            }
        }, 3000);
    }

    // Start the widget
    initializeWidget();

    // Expose a manual refresh function for debugging
    window.refreshDebtWidget = function() {
        console.log('[DebtWidget] Manual refresh triggered');
        fetchDebtData();
    };

    // Expose configuration for external modification
    window.DebtWidgetConfig = DebtWidgetConfig;
    
    // Expose element finder for debugging
    window.findDebtWidgetElements = getWidgetElements;
    
    console.log('[DebtWidget] 📦 Script loaded successfully - v1.0.2');

})();
