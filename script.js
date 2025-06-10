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
        document.getElementById('truck-bushings').textContent = '--';
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
        const hardwareSpecs = this.calculateHardwareSpecs(data, deckSpecs, wheelSpecs);
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
        // Base width from shoe size (convert to US first)
        const shoeSizeUS = this.convertToUSShoeSize(data.shoeSize, data.shoeRegion, data.shoeGender);
        
        let baseWidth = 8.0; // Default
        if (shoeSizeUS <= 7.5) {
            baseWidth = 7.875; // 7.75-8.0 range, choose middle-high
        } else if (shoeSizeUS >= 8 && shoeSizeUS <= 9.5) {
            baseWidth = 8.25; // 8.0-8.5 range, choose middle
        } else if (shoeSizeUS >= 10) {
            baseWidth = 9.0; // 8.5-9.5 range, choose middle
        }

        // Add height adjustment
        if (data.height >= 163 && data.height <= 180) {
            baseWidth += 0.25;
        } else if (data.height > 180) {
            baseWidth += 0.5;
        }

        // Style adjustment
        const styleAdjustments = {
            'street': -0.25,
            'park': 0,
            'cruising': 0.5,
            'longboard': 0.5,
            'mixed': 0
        };
        baseWidth += styleAdjustments[data.ridingStyle] || 0;

        // Clamp to valid range
        const deckWidth = Math.max(7.75, Math.min(10.0, baseWidth));

        // Calculate wheelbase and length based on style
        let wheelbase, deckLength;
        switch (data.ridingStyle) {
            case 'street':
                wheelbase = 13.5; // 13-14" range
                deckLength = wheelbase + 18; // ~31.5"
                break;
            case 'park':
            case 'mixed':
                wheelbase = 14.25; // 14-14.5" range
                deckLength = wheelbase + 18; // ~32.25"
                break;
            case 'cruising':
            case 'longboard':
                wheelbase = 15.0; // 14.5-15.5" range
                deckLength = wheelbase + 20; // ~35"
                break;
            default:
                wheelbase = 14.0;
                deckLength = 32.0;
        }

        // Concave based on rider flexibility
        const concaveByFlexibility = {
            'low': 'Mellow',    // Low flexibility = shallow for comfort
            'medium': 'Medium',
            'high': 'Deep'      // High flexibility = deep for tech tricks
        };
        const concave = concaveByFlexibility[data.flexibility] || 'Medium';

        // Construction based on board feel and weight
        let construction = '7-ply Maple';
        if (data.boardFeel === 'durable' || data.weight > 100) {
            construction = 'Reinforced 7-ply';
        }

        return {
            width: Math.round(deckWidth * 8) / 8, // Round to nearest 1/8"
            length: Math.round(deckLength * 10) / 10,
            wheelbase: Math.round(wheelbase * 10) / 10,
            concave: concave,
            construction: construction
        };
    }

    // Helper method to convert shoe sizes to US
    convertToUSShoeSize(sizeEU, region, gender) {
        // Convert from EU to US (our base calculation uses US sizes)
        const conversions = {
            'EU': { 'M': (eu) => eu - 33, 'W': (eu) => eu - 31 },
            'US': { 'M': (us) => us, 'W': (us) => us },
            'UK': { 'M': (uk) => uk + 0.5, 'W': (uk) => uk + 2 },
            'AU': { 'M': (au) => au + 0.5, 'W': (au) => au + 2 },
            'CN': { 'M': (cn) => (cn - 18) - 33, 'W': (cn) => (cn - 18) - 31 },
            'JP': { 'M': (jp) => (jp - 18) - 33, 'W': (jp) => (jp - 18) - 31 },
            'BR': { 'M': (br) => (br + 4) - 33, 'W': (br) => (br + 2) - 31 }
        };

        if (conversions[region] && conversions[region][gender]) {
            return conversions[region][gender](sizeEU);
        }
        return sizeEU - 33; // Default to EU men's conversion
    }

    calculateTruckSpecs(data, deckSpecs) {
        // Axle width should be approximately deck width ±0.125"
        const truckWidth = deckSpecs.width;

        // Height based on riding style
        let truckHeight = 'Mid'; // Default
        switch (data.ridingStyle) {
            case 'street':
                truckHeight = 'Low';
                break;
            case 'park':
            case 'mixed':
                truckHeight = 'Mid';
                break;
            case 'cruising':
            case 'longboard':
                truckHeight = 'High';
                break;
        }

        // Tightness based on stability rating (1-10 scale)
        // Response = 11 - stabilityRating
        const responseLevel = 11 - data.stabilityPreference;
        let tightness = 'Medium';
        
        if (responseLevel <= 3) {
            tightness = 'Loose';
        } else if (responseLevel <= 5) {
            tightness = 'Medium-Loose';
        } else if (responseLevel <= 7) {
            tightness = 'Medium';
        } else if (responseLevel <= 9) {
            tightness = 'Medium-Tight';
        } else {
            tightness = 'Tight';
        }

        // Responsiveness is inverted tightness
        const responsivenessMap = {
            'Loose': 'High',
            'Medium-Loose': 'Medium-High',
            'Medium': 'Standard',
            'Medium-Tight': 'Medium-Low',
            'Tight': 'Low'
        };
        const responsiveness = responsivenessMap[tightness] || 'Standard';

        return {
            width: truckWidth,
            height: truckHeight,
            tightness: tightness,
            responsiveness: responsiveness
        };
    }

    calculateWheelSpecs(data) {
        // Diameter based on riding style
        let diameter = 54; // Default
        switch (data.ridingStyle) {
            case 'street':
                diameter = 54; // 52-56mm range, choose middle-high
                break;
            case 'park':
                diameter = 58; // 56-60mm range, choose middle
                break;
            case 'cruising':
            case 'longboard':
                diameter = 62; // 60-65mm range, choose middle
                break;
            case 'mixed':
                diameter = 56; // Versatile size
                break;
        }

        // Hardness (Durometer) based on surface type
        let hardness = 99; // Default
        switch (data.terrain) {
            case 'smooth':
                hardness = 100; // 99-101A range
                break;
            case 'rough':
                hardness = 95; // 93-97A range
                break;
            case 'mixed':
                hardness = 97; // Average of smooth and rough
                break;
        }

        // Board feel adjustments
        if (data.boardFeel === 'light') {
            diameter -= 2; // Smaller for lighter setup
            hardness += 2; // Harder for less rolling resistance
        } else if (data.boardFeel === 'grippy') {
            hardness = Math.max(93, hardness - 5); // Much softer for grip (93-95A)
        } else if (data.boardFeel === 'durable') {
            // Standard sizing, balanced hardness
            hardness = Math.max(95, Math.min(99, hardness));
        }

        // Shape based on riding style
        let shape = 'Mid-profile';
        switch (data.ridingStyle) {
            case 'street':
                shape = 'Narrow/Conical';
                break;
            case 'park':
            case 'mixed':
                shape = 'Mid-profile';
                break;
            case 'cruising':
            case 'longboard':
                shape = 'Wide/Stability';
                break;
        }

        // Ensure hardness is in valid range
        hardness = Math.max(78, Math.min(101, hardness));

        return {
            diameter: Math.round(diameter),
            hardness: hardness + 'A',
            contactPatch: shape
        };
    }

    calculateHardwareSpecs(data, deckSpecs, wheelSpecs) {
        // Bearings - Standard ABEC-5+ good quality
        let bearingRating = 'ABEC 5';
        if (data.experience === 'comfortable' || data.experience === 'advanced') {
            bearingRating = 'ABEC 7';
        }
        if (data.boardFeel === 'light') {
            bearingRating = 'ABEC 7'; // Higher precision for performance
        }

        // Risers based on wheel size and board feel
        let risers = 'None';
        let hardwareLength = '7/8"';

        if (wheelSpecs.diameter > 56) {
            risers = '1/4" Standard';
            hardwareLength = '1 1/8"';
        } else if (data.boardFeel === 'durable' || data.weight > 100) {
            risers = '1/8" Hard';
            hardwareLength = '1"';
        } else if (data.boardFeel === 'grippy') {
            risers = '1/8" Soft';
            hardwareLength = '1"';
        }

        // Calculate bushings durometer based on weight and stability preference
        let bushingDurometer = '90A'; // Default
        
        if (data.weight < 75 && data.stabilityPreference >= 7) {
            bushingDurometer = '87A'; // Light weight + maneuverable
        } else if (data.weight >= 75 && data.weight <= 100) {
            bushingDurometer = '91A'; // Medium weight, balanced
        } else if (data.weight > 100 || data.stabilityPreference <= 4) {
            bushingDurometer = '94A'; // Heavy weight or stability need
        }

        // Estimate setup weight based on components
        let setupWeight = 'Medium (3.0-3.5 lbs)';
        if (data.boardFeel === 'light') {
            setupWeight = 'Light (2.6-3.0 lbs)';
        } else if (data.boardFeel === 'durable') {
            setupWeight = 'Heavy (3.5-4.2 lbs)';
        }

        return {
            bearingRating: bearingRating,
            hardwareLength: hardwareLength,
            risers: risers,
            setupWeight: setupWeight,
            bushingDurometer: bushingDurometer
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
        document.getElementById('truck-bushings').textContent = specs.bushingDurometer;

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

        // Deck sizing explanation
        explanations.push(`<strong>Deck Sizing Algorithm:</strong> Width ${deckSpecs.width}" calculated from shoe size with height and style adjustments. Industry-standard wheelbase ${deckSpecs.wheelbase}" optimized for ${data.ridingStyle} riding.`);

        // Truck setup explanation
        const responseLevel = 11 - data.stabilityPreference;
        explanations.push(`<strong>Truck Configuration:</strong> ${truckSpecs.height} height trucks with ${truckSpecs.tightness.toLowerCase()} setup (response level ${responseLevel}/10) for optimal turning characteristics.`);

        // Wheel specifications
        explanations.push(`<strong>Wheel Selection:</strong> ${wheelSpecs.diameter}mm diameter with ${wheelSpecs.hardness} hardness optimized for ${data.terrain} surfaces and ${data.ridingStyle} style.`);

        // Weight and biomechanics
        const weightDisplay = data.weightUnit === 'kg' ? `${Math.round(data.weight)}kg` : `${Math.round(data.weight * 2.20462)}lbs`;
        const heightDisplay = data.heightUnit === 'cm' ? `${Math.round(data.height)}cm` : 
            `${Math.floor(data.height / 30.48)}'${Math.round((data.height % 30.48) / 2.54)}"`;
        explanations.push(`<strong>Biomechanical Fit:</strong> Setup scaled for ${heightDisplay} height and ${weightDisplay} weight using proven skateboard industry ratios.`);

        // Flexibility accommodation
        const flexibilityExplanations = {
            'low': 'Setup accommodates limited flexibility with mellow concave and forgiving truck response.',
            'medium': 'Balanced configuration works well with average flexibility for versatile performance.',
            'high': 'Setup leverages high flexibility with deeper concave and responsive trucks for technical control.'
        };
        explanations.push(`<strong>Flexibility Accommodation:</strong> ${flexibilityExplanations[data.flexibility]}`);

        // Board feel optimization
        const boardFeelExplanations = {
            'light': 'Lightweight configuration prioritizes agility with optimized component selection for minimal weight.',
            'durable': 'Reinforced construction with protective elements designed for longevity and heavy use.',
            'grippy': 'Traction-focused setup with softer wheels and enhanced grip components for maximum control.'
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
