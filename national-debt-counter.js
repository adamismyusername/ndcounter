/**
 * US National Debt Widget - JSON Data Source Version
 * Version: 1.0.2
 * Repository: https://github.com/adamismyusername/ndcounter
 * 
 * NEW in v1.0.2:
 * - Reads from cached JSON data instead of live API
 * - Faster loading and better reliability
 * - No API rate limit concerns
 * - Enhanced CSS override support
 */

(function() {
    'use strict';
    
    // Configuration Object - Edit these settings to customize the widget
    const DebtWidgetConfig = {
        // Data source settings
        data: {
            // Primary data source - your cached JSON file
            url: 'https://adamismyusername.github.io/ndcounter/data/debt-data.json',
            // Fallback to Treasury API if JSON fails (with rate limiting protection)
            fallbackToAPI: false,  // Disabled to prevent rate limiting
            maxRetries: 2,
            retryDelay: 1000
        },
        
        // Animation settings
        animation: {
            enabled: true,               // Enable/disable the counting animation
            duration: 100000,              // Duration of animation in milliseconds
            reductionPercentage: 0.0005,    // Start animation from X% less than actual value
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
        
        // Refresh settings - disabled since data is cached
        refresh: {
            autoRefresh: false,         // Disabled - data refreshes via GitHub Actions
            interval: 86400000          // 24 hours (not used when autoRefresh is false)
        },
        
        // Emergency fallback data (only used if JSON file and API both fail)
        fallback: {
            debtAmount: 36215124313382.16,
            lastUpdated: '2025-06-27',
            source: 'Emergency fallback data'
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

    // Simple format function (for non-HTML use cases)
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

    // Sleep function for retry delays
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fetch data with retries
    async function fetchWithRetry(url, retryCount = 0) {
        try {
            console.log(`[DebtWidget] Fetching data (attempt ${retryCount + 1}):`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('[DebtWidget] ✅ Data fetched successfully');
            return data;
            
        } catch (error) {
            console.warn(`[DebtWidget] Fetch attempt ${retryCount + 1} failed:`, error.message);
            
            if (retryCount < DebtWidgetConfig.data.maxRetries) {
                await sleep(DebtWidgetConfig.data.retryDelay * (retryCount + 1));
                return fetchWithRetry(url, retryCount + 1);
            }
            
            throw error;
        }
    }

    // Fallback to Treasury API (only if enabled and JSON fails)
    async function fetchFromTreasuryAPI() {
        if (!DebtWidgetConfig.data.fallbackToAPI) {
            throw new Error('Treasury API fallback is disabled');
        }
        
        console.log('[DebtWidget] Attempting Treasury API fallback...');
        const apiUrl = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=1&format=json';
        
        const response = await fetchWithRetry(apiUrl);
        
        if (response.data && response.data.length > 0) {
            const latest = response.data[0];
            
            // Convert to our standard format
            return {
                amount: parseFloat(latest.tot_pub_debt_out_amt),
                date: latest.record_date,
                lastUpdated: new Date().toISOString(),
                source: 'U.S. Treasury API (live)',
                version: '1.0.2'
            };
        } else {
            throw new Error('No data found in Treasury API response');
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
            console.log('[DebtWidget] Loading debt data...');
            
            let debtData = null;
            
            try {
                // Try to fetch from cached JSON data first
                debtData = await fetchWithRetry(DebtWidgetConfig.data.url);
                console.log('[DebtWidget] ✅ Loaded data from cached JSON');
            } catch (jsonError) {
                console.warn('[DebtWidget] JSON data failed, trying fallback:', jsonError.message);
                
                try {
                    // Try Treasury API fallback if enabled
                    debtData = await fetchFromTreasuryAPI();
                    console.log('[DebtWidget] ✅ Loaded data from Treasury API fallback');
                } catch (apiError) {
                    console.warn('[DebtWidget] Treasury API fallback failed:', apiError.message);
                    throw new Error('All data sources failed');
                }
            }
            
            // Validate data structure
            if (!debtData || typeof debtData.amount !== 'number' || !debtData.date) {
                throw new Error('Invalid data structure received');
            }
            
            console.log('[DebtWidget] Data loaded:', {
                amount: debtData.amount,
                date: debtData.date,
                source: debtData.source || 'Unknown'
            });
            
            // Update debt amount with animation
            const startValue = debtData.amount * (1 - DebtWidgetConfig.animation.reductionPercentage);
            animateCount(startValue, debtData.amount, elements.debtAmount);
            
            // Update date
            if (elements.dateElement) {
                const recordDate = new Date(debtData.date);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                elements.dateElement.textContent = `Updated: ${recordDate.toLocaleDateString('en-US', options)}`;
            }
            
            console.log('[DebtWidget] ✅ Widget updated successfully');
            
        } catch (error) {
            console.warn('[DebtWidget] All data sources failed, using emergency fallback:', error.message);
            
            // Use emergency fallback data
            const fallbackAmount = DebtWidgetConfig.fallback.debtAmount;
            const startValue = fallbackAmount * (1 - DebtWidgetConfig.animation.reductionPercentage);
            
            if (elements.debtAmount) {
                animateCount(startValue, fallbackAmount, elements.debtAmount);
            }
            
            if (elements.dateElement) {
                const fallbackDate = new Date(DebtWidgetConfig.fallback.lastUpdated);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                elements.dateElement.textContent = `Updated: ${fallbackDate.toLocaleDateString('en-US', options)} (Emergency Data)`;
            }
            
            console.log('[DebtWidget] ⚠️ Emergency fallback data loaded');
        }
    }

    // Initialize the widget
    function initDebtWidget() {
        console.log('[DebtWidget] 🚀 Initializing US National Debt Widget v1.0.2...');
        
        const elements = getWidgetElements();
        
        if (elements.debtAmount) {
            console.log('[DebtWidget] Widget elements found, loading data...');
            
            fetchDebtData();
            
            // Note: Auto-refresh is disabled since data is updated via GitHub Actions
            if (DebtWidgetConfig.refresh.autoRefresh) {
                console.log(`[DebtWidget] Auto-refresh enabled: every ${DebtWidgetConfig.refresh.interval / 1000 / 60} minutes`);
                setInterval(fetchDebtData, DebtWidgetConfig.refresh.interval);
            } else {
                console.log('[DebtWidget] Auto-refresh disabled - data updates via GitHub Actions');
            }
        } else {
            console.error('[DebtWidget] Widget elements not found. Please check your HTML structure.');
            console.error('[DebtWidget] Required: #debt-widget-container, #debt-amount, #last-updated-date, #data-source');
        }
    }

    // Enhanced initialization
    function initializeWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDebtWidget);
        } else {
            initDebtWidget();
        }
        
        // Backup initialization
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

    // Expose manual refresh function for debugging
    window.refreshDebtWidget = function() {
        console.log('[DebtWidget] Manual refresh triggered');
        fetchDebtData();
    };

    // Expose configuration for external modification
    window.DebtWidgetConfig = DebtWidgetConfig;
    
    console.log('[DebtWidget] 📦 Script loaded successfully - v1.0.2 (JSON Data Source)');

})();
