// Skateboard Right-Sizing Calculator
// Physics-based calculations for optimal skateboard component selection

class SkateboardCalculator {
    constructor() {
        this.form = document.getElementById('skateboard-form');
        this.resultsContainer = document.getElementById('results-container');
        this.initializeEventListeners();
        this.initializeUnitHandlers();
        this.showResults(); // Always show results panel
        this.setEmptyState(); // Initialize with empty/greyed out state
    }

    initializeEventListeners() {
        // Add event listeners to all form inputs for real-time updates
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.handleInputChange());
            input.addEventListener('change', () => this.handleInputChange());
        });
    }

    initializeUnitHandlers() {
        // Height unit handler
        const heightUnit = document.getElementById('height-unit');
        const heightInput = document.getElementById('height');
        const heightFtIn = document.getElementById('height-ft-in');

        heightUnit.addEventListener('change', () => {
            if (heightUnit.value === 'ft-in') {
                heightInput.style.display = 'none';
                heightFtIn.style.display = 'flex';
            } else {
                heightInput.style.display = 'block';
                heightFtIn.style.display = 'none';
            }
            this.handleInputChange();
        });

        // Shoe region handler
        const shoeRegion = document.getElementById('shoe-region');
        const shoeGender = document.getElementById('shoe-gender');

        shoeRegion.addEventListener('change', () => {
            // Show gender selector for regions that differentiate
            if (['US', 'UK', 'AU', 'BR'].includes(shoeRegion.value)) {
                shoeGender.style.display = 'block';
                shoeGender.required = true;
            } else {
                shoeGender.style.display = 'none';
                shoeGender.required = false;
                shoeGender.value = 'M'; // Default to men's for regions without differentiation
            }
            this.handleInputChange();
        });
    }

    // Unit conversion functions
    convertHeightToCm(height, unit, heightFt = 0, heightIn = 0) {
        if (unit === 'cm') {
            return height;
        } else if (unit === 'ft-in') {
            return (heightFt * 30.48) + (heightIn * 2.54);
        }
        return height;
    }

    convertWeightToKg(weight, unit) {
        if (unit === 'kg') {
            return weight;
        } else if (unit === 'lbs') {
            return weight * 0.453592;
        }
        return weight;
    }

    // Shoe size conversion to EU (base standard)
    convertShoeToEU(size, region, gender = 'M') {
        const conversions = {
            'US': {
                'M': (us) => us + 32.5,
                'W': (us) => us + 30.5
            },
            'UK': {
                'M': (uk) => uk + 33,
                'W': (uk) => uk + 32.5
            },
            'AU': {
                'M': (au) => au + 32,
                'W': (au) => au + 31.5
            },
            'CN': {
                'M': (cn) => cn - 18,
                'W': (cn) => cn - 18
            },
            'JP': {
                'M': (jp) => jp - 18,
                'W': (jp) => jp - 18
            },
            'BR': {
                'M': (br) => br + 4,
                'W': (br) => br + 2
            },
            'EU': {
                'M': (eu) => eu,
                'W': (eu) => eu
            }
        };

        if (conversions[region] && conversions[region][gender]) {
            return conversions[region][gender](size);
        }
        return size; // Fallback to original size
    }

    handleInputChange() {
        const formData = this.getFormData();
        
        // Always show results panel, but update content based on available data
        if (this.hasMinimumData(formData)) {
            this.enableResults();
            this.calculateRecommendations(formData);
        } else {
            this.setEmptyState();
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        
        // Get height in cm
        const heightUnit = formData.get('heightUnit');
        let heightCm = 0;
        if (heightUnit === 'cm') {
            heightCm = parseFloat(formData.get('height')) || 0;
        } else if (heightUnit === 'ft-in') {
            const heightFt = parseFloat(formData.get('heightFt')) || 0;
            const heightIn = parseFloat(formData.get('heightIn')) || 0;
            heightCm = this.convertHeightToCm(0, 'ft-in', heightFt, heightIn);
        }

        // Get weight in kg
        const weightUnit = formData.get('weightUnit');
        const weightInput = parseFloat(formData.get('weight')) || 0;
        const weightKg = this.convertWeightToKg(weightInput, weightUnit);

        // Get shoe size in EU
        const shoeRegion = formData.get('shoeRegion');
        const shoeGender = formData.get('shoeGender') || 'M';
        const shoeSizeInput = parseFloat(formData.get('shoeSize')) || 0;
        const shoeSizeEU = this.convertShoeToEU(shoeSizeInput, shoeRegion, shoeGender);

        return {
            height: heightCm,
            weight: weightKg,
            shoeSize: shoeSizeEU,
            experience: formData.get('experience') || '',
            ridingStyle: formData.get('ridingStyle') || '',
            terrain: formData.get('terrain') || '',
            stabilityPreference: parseInt(formData.get('stabilityPreference')) || 5,
            flexibility: formData.get('flexibility') || '',
            boardFeel: formData.get('boardFeel') || '',
            // Store original units for display
            originalHeight: weightInput,
            heightUnit: heightUnit,
            originalWeight: weightInput,
            weightUnit: weightUnit,
            originalShoeSize: shoeSizeInput,
            shoeRegion: shoeRegion,
            shoeGender: shoeGender
        };
    }

    hasMinimumData(data) {
        return data.height > 0 && data.weight > 0 && data.shoeSize > 0 && 
               data.experience && data.ridingStyle && data.terrain && 
               data.flexibility && data.boardFeel;
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    enableResults() {
        this.resultsContainer.classList.remove('empty-state');
        this.resultsContainer.classList.add('active-state');
    }

    setEmptyState() {
        this.resultsContainer.classList.add('empty-state');
        this.resultsContainer.classList.remove('active-state');
        
        // Set all values to placeholder state
        document.getElementById('deck-width').textContent = '--';
        document.getElementById('deck-length').textContent = '--';
        document.getElementById('wheelbase').textContent = '--';
        document.getElementById('deck-concave').textContent = '--';
        document.getElementById('deck-construction').textContent = '--';
        document.getElementById('truck-width').textContent = '--';
        document.getElementById('truck-height').textContent = '--';
        document.getElementById('truck-tightness').textContent = '--';
        document.getElementById('truck-responsiveness').textContent = '--';
        document.getElementById('wheel-diameter').textContent = '--';
        document.getElementById('wheel-hardness').textContent = '--';
        document.getElementById('wheel-contact').textContent = '--';
        document.getElementById('bearing-rating').textContent = '--';
        document.getElementById('hardware-length').textContent = '--';
        document.getElementById('risers').textContent = '--';
        document.getElementById('setup-weight').textContent = '--';
        
        // Clear explanations
        document.getElementById('deck-explanation').textContent = 'Enter your details to see deck recommendations';
        document.getElementById('truck-explanation').textContent = 'Enter your details to see truck recommendations';
        document.getElementById('wheel-explanation').textContent = 'Enter your details to see wheel recommendations';
        document.getElementById('bearing-explanation').textContent = 'Enter your details to see hardware recommendations';
        document.getElementById('physics-explanation').innerHTML = 'Complete the form to see the science behind your personalized skateboard setup.';
    }

    hideResults() {
        // Remove this method since we always show results now
        // Keeping for backward compatibility but not used
    }

    calculateRecommendations(data) {
        // Add updating animation
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => card.classList.add('updating'));
        
        // Add transition animation to container
        this.resultsContainer.classList.add('transitioning');

        // Calculate deck specifications
        const deckSpecs = this.calculateDeckSpecs(data);
        this.updateDeckResults(deckSpecs, data);

        // Calculate truck specifications
        const truckSpecs = this.calculateTruckSpecs(data, deckSpecs);
        this.updateTruckResults(truckSpecs, data);

        // Calculate wheel specifications
        const wheelSpecs = this.calculateWheelSpecs(data);
        this.updateWheelResults(wheelSpecs, data);

        // Calculate bearing and hardware specs
        const hardwareSpecs = this.calculateHardwareSpecs(data, deckSpecs);
        this.updateHardwareResults(hardwareSpecs, data);

        // Generate physics explanation
        this.updatePhysicsExplanation(data, deckSpecs, truckSpecs, wheelSpecs);

        // Remove updating animation
        setTimeout(() => {
            resultCards.forEach(card => card.classList.remove('updating'));
            this.resultsContainer.classList.remove('transitioning');
        }, 300);
    }

    calculateDeckSpecs(data) {
        // Physics-based deck width calculation
        // Based on shoe size and biomechanics research
        const shoeToWidthRatio = {
            35: 7.5, 36: 7.6, 37: 7.7, 38: 7.8, 39: 7.9, 40: 8.0,
            41: 8.1, 42: 8.2, 43: 8.3, 44: 8.4, 45: 8.5, 46: 8.6,
            47: 8.7, 48: 8.8, 49: 8.9, 50: 9.0
        };

        let baseWidth = shoeToWidthRatio[Math.round(data.shoeSize)] || 8.0;

        // Adjust for riding style
        const styleAdjustments = {
            'street': -0.1,      // Narrower for flip tricks
            'park': 0.1,         // Wider for stability
            'cruising': 0.2,     // Much wider for comfort
            'longboard': 0.5,    // Significantly wider
            'mixed': 0.0         // No adjustment
        };

        baseWidth += styleAdjustments[data.ridingStyle] || 0;

        // Adjust for experience (beginners need more stability)
        if (data.experience === 'beginner') baseWidth += 0.2;
        if (data.experience === 'comfortable') baseWidth += 0.05;
        if (data.experience === 'advanced') baseWidth -= 0.1;

        // Calculate length based on height and riding style
        // Using biomechanical proportions
        let baseLength = (data.height * 0.18) + 10; // Base formula

        const lengthAdjustments = {
            'street': -2,        // Shorter for maneuverability
            'park': 0,           // Standard length
            'cruising': 3,       // Longer for stability
            'longboard': 15,     // Much longer
            'mixed': 1           // Slightly longer
        };

        baseLength += lengthAdjustments[data.ridingStyle] || 0;

        // Calculate wheelbase (affects stability vs maneuverability)
        // Physics: longer wheelbase = more stable, shorter = more maneuverable
        let wheelbase = baseLength * 0.65; // Standard ratio

        // Adjust based on stability preference (1-10 scale)
        const stabilityFactor = (data.stabilityPreference - 5) * 0.5;
        wheelbase += stabilityFactor;

        // Calculate concave based on rider flexibility
        // Physics: riders with lower flexibility need shallower concave for comfort
        let concave = 'Medium'; // Default
        
        const concaveByFlexibility = {
            'low': 'Mellow',    // Low flexibility = shallow concave for comfort
            'medium': 'Medium', // Balanced
            'high': 'Deep'      // High flexibility = can handle deeper concave
        };
        
        concave = concaveByFlexibility[data.flexibility] || 'Medium';
        
        // Adjust concave based on riding style
        if (data.ridingStyle === 'street') {
            concave = concave === 'Mellow' ? 'Medium' : 'Deep'; // Street needs more control
        } else if (data.ridingStyle === 'cruising') {
            concave = concave === 'Deep' ? 'Medium' : 'Mellow'; // Cruising prioritizes comfort
        }

        // Calculate construction based on board feel preference
        let construction = '7-ply Maple'; // Default
        
        const constructionByFeel = {
            'light': '7-ply Maple',           // Standard lightweight
            'durable': '8-ply + Tech Laminate', // Stronger construction
            'grippy': '7-ply + Grip Enhancement' // Standard with better grip
        };
        
        construction = constructionByFeel[data.boardFeel] || '7-ply Maple';

        return {
            width: Math.round(baseWidth * 10) / 10,
            length: Math.round(baseLength * 10) / 10,
            wheelbase: Math.round(wheelbase * 10) / 10,
            concave: concave,
            construction: construction
        };
    }

    calculateTruckSpecs(data, deckSpecs) {
        // Truck width should match deck width for optimal performance
        // Physics: truck width affects turning radius and stability
        const truckWidth = deckSpecs.width;

        // Calculate truck height based on wheel size and riding style
        let truckHeight = 'Mid'; // Default

        if (data.ridingStyle === 'cruising' || data.ridingStyle === 'longboard') {
            truckHeight = 'High'; // Need clearance for larger wheels
        } else if (data.ridingStyle === 'street') {
            truckHeight = 'Low'; // Lower center of gravity for tricks
        }

        // Calculate recommended tightness based on weight and preference
        // Physics: heavier riders need tighter trucks for control
        let tightness = 'Medium';
        
        if (data.weight > 80) {
            tightness = data.stabilityPreference > 6 ? 'Medium-Tight' : 'Tight';
        } else if (data.weight < 60) {
            tightness = data.stabilityPreference < 4 ? 'Loose' : 'Medium-Loose';
        } else {
            if (data.stabilityPreference > 7) tightness = 'Medium-Tight';
            if (data.stabilityPreference < 3) tightness = 'Medium-Loose';
        }

        // Adjust for experience
        if (data.experience === 'beginner') {
            tightness = tightness.includes('Loose') ? 'Medium' : tightness;
        } else if (data.experience === 'advanced') {
            if (tightness === 'Medium' && data.stabilityPreference < 5) {
                tightness = 'Medium-Loose';
            }
        }

        // Calculate responsiveness based on rider flexibility and board feel
        // Physics: less flexible riders need smoother, more forgiving setups
        let responsiveness = 'Standard'; // Default
        
        const responsivenessByFlexibility = {
            'low': 'Smooth',    // Low flexibility = smoother, more forgiving
            'medium': 'Standard', // Balanced
            'high': 'High'      // High flexibility = can handle quick response
        };
        
        responsiveness = responsivenessByFlexibility[data.flexibility] || 'Standard';
        
        // Adjust based on board feel preference
        if (data.boardFeel === 'light') {
            responsiveness = responsiveness === 'Smooth' ? 'Standard' : 'High';
        } else if (data.boardFeel === 'grippy') {
            responsiveness = responsiveness === 'High' ? 'Standard' : 'Smooth';
        }
        
        // Adjust based on riding style
        if (data.ridingStyle === 'street') {
            responsiveness = responsiveness === 'Smooth' ? 'Standard' : 'High';
        } else if (data.ridingStyle === 'cruising' || data.ridingStyle === 'longboard') {
            responsiveness = responsiveness === 'High' ? 'Standard' : 'Smooth';
        }

        return {
            width: truckWidth,
            height: truckHeight,
            tightness: tightness,
            responsiveness: responsiveness
        };
    }

    calculateWheelSpecs(data) {
        // Wheel diameter calculation based on riding style and terrain
        // Physics: larger wheels = faster, smoother ride; smaller = more responsive
        let diameter = 54; // Default street size

        const diameterByStyle = {
            'street': 52,        // Small for tricks
            'park': 56,          // Medium for transitions
            'cruising': 60,      // Large for smooth ride
            'longboard': 70,     // Very large for speed
            'mixed': 55          // Versatile size
        };

        diameter = diameterByStyle[data.ridingStyle] || 54;

        // Adjust for terrain
        if (data.terrain === 'rough') diameter += 4;
        if (data.terrain === 'smooth') diameter -= 2;

        // Calculate hardness (durometer) based on weight, style, and terrain
        // Physics: harder wheels = faster, less grip; softer = more grip, smoother
        let hardness = 99; // Default street hardness

        const hardnessByStyle = {
            'street': 99,        // Hard for tricks
            'park': 97,          // Slightly softer for grip
            'cruising': 85,      // Soft for comfort
            'longboard': 80,     // Very soft for grip and comfort
            'mixed': 92          // Medium hardness
        };

        hardness = hardnessByStyle[data.ridingStyle] || 99;

        // Adjust for terrain and weight
        if (data.terrain === 'rough') hardness -= 5;
        if (data.weight > 80) hardness += 2; // Heavier riders need harder wheels
        if (data.weight < 60) hardness -= 2; // Lighter riders can use softer

        // Adjust based on board feel preference
        if (data.boardFeel === 'light') {
            diameter -= 2; // Smaller wheels for lighter setup
            hardness += 3; // Harder for less rolling resistance
        } else if (data.boardFeel === 'grippy') {
            hardness -= 8; // Much softer for grip (93-95A range)
            if (diameter < 56) diameter += 2; // Slightly larger for better roll
        } else if (data.boardFeel === 'durable') {
            // Standard sizing but mid-range hardness for durability
            hardness = Math.max(hardness - 2, 95); // Not too soft, not too hard
        }

        // Calculate contact patch (affects grip and speed)
        const contactPatch = diameter < 60 ? 'Narrow' : diameter < 65 ? 'Medium' : 'Wide';

        return {
            diameter: Math.round(diameter),
            hardness: Math.max(78, Math.min(101, hardness)) + 'A',
            contactPatch: contactPatch
        };
    }

    calculateHardwareSpecs(data, deckSpecs) {
        // Bearing rating based on riding style and experience
        let bearingRating = 'ABEC 5'; // Standard rating

        if (data.ridingStyle === 'longboard' || data.ridingStyle === 'cruising') {
            bearingRating = 'ABEC 7'; // Higher precision for speed
        }
        if (data.experience === 'comfortable' || data.experience === 'advanced') {
            bearingRating = 'ABEC 7';
        }

        // Adjust bearing rating based on board feel
        if (data.boardFeel === 'light') {
            bearingRating = 'ABEC 7'; // Higher precision for performance
        }

        // Hardware length calculation
        // Physics: must account for deck thickness + truck baseplate + riser (if any)
        let hardwareLength = '1"'; // Standard
        let risers = 'None'; // Default

        // Determine risers based on board feel and wheel size
        if (data.boardFeel === 'grippy') {
            risers = '1/8" Soft'; // Slight lift for better feel
            hardwareLength = '1.25"';
        } else if (data.ridingStyle === 'cruising' || data.ridingStyle === 'longboard') {
            risers = '1/4" Standard'; // More clearance for larger wheels
            hardwareLength = '1.5"';
        } else if (data.boardFeel === 'durable') {
            risers = '1/8" Hard'; // Protection without too much lift
            hardwareLength = '1.25"';
        }

        // Calculate approximate setup weight
        let setupWeight = 'Medium'; // Default
        
        if (data.boardFeel === 'light') {
            setupWeight = 'Light (2.8-3.2 lbs)';
        } else if (data.boardFeel === 'durable') {
            setupWeight = 'Heavy (3.5-4.0 lbs)';
        } else {
            setupWeight = 'Medium (3.0-3.5 lbs)';
        }

        return {
            bearingRating: bearingRating,
            hardwareLength: hardwareLength,
            risers: risers,
            setupWeight: setupWeight
        };
    }

    updateDeckResults(specs, data) {
        document.getElementById('deck-width').textContent = `${specs.width}"`;
        document.getElementById('deck-length').textContent = `${specs.length}"`;
        document.getElementById('wheelbase').textContent = `${specs.wheelbase}"`;
        document.getElementById('deck-concave').textContent = specs.concave;
        document.getElementById('deck-construction').textContent = specs.construction;

        const explanation = this.getDeckExplanation(specs, data);
        document.getElementById('deck-explanation').textContent = explanation;
    }

    updateTruckResults(specs, data) {
        document.getElementById('truck-width').textContent = `${specs.width}"`;
        document.getElementById('truck-height').textContent = specs.height;
        document.getElementById('truck-tightness').textContent = specs.tightness;
        document.getElementById('truck-responsiveness').textContent = specs.responsiveness;

        const explanation = this.getTruckExplanation(specs, data);
        document.getElementById('truck-explanation').textContent = explanation;
    }

    updateWheelResults(specs, data) {
        document.getElementById('wheel-diameter').textContent = `${specs.diameter}mm`;
        document.getElementById('wheel-hardness').textContent = specs.hardness;
        document.getElementById('wheel-contact').textContent = specs.contactPatch;

        const explanation = this.getWheelExplanation(specs, data);
        document.getElementById('wheel-explanation').textContent = explanation;
    }

    updateHardwareResults(specs, data) {
        document.getElementById('bearing-rating').textContent = specs.bearingRating;
        document.getElementById('hardware-length').textContent = specs.hardwareLength;
        document.getElementById('risers').textContent = specs.risers;
        document.getElementById('setup-weight').textContent = specs.setupWeight;

        const explanation = this.getHardwareExplanation(specs, data);
        document.getElementById('bearing-explanation').textContent = explanation;
    }

    getDeckExplanation(specs, data) {
        let explanation = `Width ${specs.width}" matches your shoe size for optimal foot placement. `;
        
        if (data.ridingStyle === 'street') {
            explanation += "Narrower deck chosen for easier flip tricks and technical maneuvers. ";
        } else if (data.ridingStyle === 'cruising') {
            explanation += "Wider deck provides more stability and comfort for cruising. ";
        } else {
            explanation += `Length ${specs.length}" provides good balance for your height and riding style. `;
        }
        
        // Add concave explanation
        const concaveExplanations = {
            'Deep': 'Deep concave provides maximum control and board feel for technical riding.',
            'Medium': 'Medium concave offers a balanced feel between control and comfort.',
            'Mellow': 'Mellow concave prioritizes comfort for longer rides and cruising.'
        };
        explanation += concaveExplanations[specs.concave];

        return explanation;
    }

    getTruckExplanation(specs, data) {
        let explanation = `${specs.height} trucks chosen for your riding style. `;
        explanation += `${specs.tightness} tightness recommended based on your weight (${data.weight}kg) and stability preference. `;
        
        // Add responsiveness explanation
        const responsivenessExplanations = {
            'High': 'High responsiveness for quick, precise turns and technical maneuvers.',
            'Standard': 'Standard responsiveness provides balanced turning characteristics.',
            'Smooth': 'Smooth responsiveness for stable, predictable turning feel.'
        };
        explanation += responsivenessExplanations[specs.responsiveness];
        
        return explanation;
    }

    getWheelExplanation(specs, data) {
        let explanation = `${specs.diameter}mm wheels balance speed and maneuverability for ${data.ridingStyle}. `;
        explanation += `${specs.hardness} hardness provides optimal grip for ${data.terrain} terrain.`;
        return explanation;
    }

    getHardwareExplanation(specs, data) {
        let explanation = `${specs.bearingRating} bearings provide good performance for your riding style. `;
        explanation += `${specs.hardwareLength} hardware with ${specs.risers.toLowerCase()} risers. `;
        
        const boardFeelExplanations = {
            'light': 'Lightweight setup prioritizes agility and easy handling.',
            'durable': 'Durable construction built for strength and longevity.',
            'grippy': 'Grippy setup optimized for traction and control.'
        };
        explanation += boardFeelExplanations[data.boardFeel];
        
        return explanation;
    }

    updatePhysicsExplanation(data, deckSpecs, truckSpecs, wheelSpecs) {
        const explanations = [];

        // Center of gravity explanation
        explanations.push(`<strong>Center of Gravity:</strong> Your ${deckSpecs.width}" deck width lowers your center of gravity relative to your shoe size, improving balance and control.`);

        // Moment of inertia explanation
        explanations.push(`<strong>Rotational Physics:</strong> The ${deckSpecs.wheelbase}" wheelbase creates optimal moment of inertia - longer for stability, shorter for quick turns.`);

        // Rolling resistance
        explanations.push(`<strong>Rolling Dynamics:</strong> ${wheelSpecs.diameter}mm wheels with ${wheelSpecs.hardness} hardness minimize rolling resistance while maximizing grip for your terrain.`);

        // Weight distribution with converted units
        const weightDisplay = data.weightUnit === 'kg' ? `${Math.round(data.weight)}kg` : `${Math.round(data.weight * 2.20462)}lbs`;
        if (data.weight > 80) {
            explanations.push(`<strong>Load Distribution:</strong> Your weight (${weightDisplay}) requires ${truckSpecs.tightness.toLowerCase()} trucks to maintain proper load distribution and prevent speed wobbles.`);
        }

        // Biomechanics with converted units
        const heightDisplay = data.heightUnit === 'cm' ? `${Math.round(data.height)}cm` : 
            `${Math.floor(data.height / 30.48)}'${Math.round((data.height % 30.48) / 2.54)}"`;
        explanations.push(`<strong>Biomechanics:</strong> Setup optimized for your height (${heightDisplay}) ensures natural stance width and efficient power transfer.`);

        // Experience level consideration
        const experienceExplanations = {
            'beginner': 'Setup prioritizes stability and forgiveness to build confidence.',
            'comfortable': 'Balanced setup allows progression while maintaining control.',
            'intermediate': 'Setup fine-tuned for your developed preferences and skills.',
            'advanced': 'Performance-oriented setup maximizes responsiveness and precision.'
        };
        explanations.push(`<strong>Experience Factor:</strong> ${experienceExplanations[data.experience]}`);

        // Flexibility consideration
        const flexibilityExplanations = {
            'low': 'Setup accommodates limited flexibility with mellow concave and smooth responsiveness for comfort.',
            'medium': 'Balanced setup works well with average flexibility for good control and comfort.',
            'high': 'Setup takes advantage of high flexibility with deeper concave and responsive trucks for maximum control.'
        };
        explanations.push(`<strong>Flexibility Accommodation:</strong> ${flexibilityExplanations[data.flexibility]}`);

        // Board feel consideration
        const boardFeelExplanations = {
            'light': 'Lightweight configuration with smaller wheels and minimal extras for maximum agility.',
            'durable': 'Reinforced construction with protective elements for longevity and heavy use.',
            'grippy': 'Grip-focused setup with softer wheels and enhanced traction components.'
        };
        explanations.push(`<strong>Board Feel Optimization:</strong> ${boardFeelExplanations[data.boardFeel]}`);

        document.getElementById('physics-explanation').innerHTML = explanations.join('<br><br>');
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkateboardCalculator();
});

// Add some utility functions for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better mobile experience
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    // Add visual feedback for range slider
    const stabilitySlider = document.getElementById('stability-preference');
    const updateSliderBackground = () => {
        const value = stabilitySlider.value;
        const percentage = ((value - 1) / 9) * 100;
        stabilitySlider.style.background = `linear-gradient(to right, #667eea 0%, #667eea ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
    };

    stabilitySlider.addEventListener('input', updateSliderBackground);
    updateSliderBackground(); // Initial call

    // Add form validation feedback
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.style.borderColor = '#fc8181';
            } else {
                input.style.borderColor = '#48bb78';
            }
        });

        input.addEventListener('input', () => {
            if (input.value !== '') {
                input.style.borderColor = '#48bb78';
            }
        });
    });
});
