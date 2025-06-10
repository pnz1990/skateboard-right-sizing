// Skateboard Right-Sizing Calculator
// Physics-based calculations for optimal skateboard component selection

class SkateboardCalculator {
    constructor() {
        this.form = document.getElementById('skateboard-form');
        this.resultsContainer = document.getElementById('results-container');
        this.initializeEventListeners();
        this.hideResults();
    }

    initializeEventListeners() {
        // Add event listeners to all form inputs for real-time updates
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.handleInputChange());
            input.addEventListener('change', () => this.handleInputChange());
        });
    }

    handleInputChange() {
        const formData = this.getFormData();
        
        // Only calculate if we have minimum required data
        if (this.hasMinimumData(formData)) {
            this.showResults();
            this.calculateRecommendations(formData);
        } else {
            this.hideResults();
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        return {
            height: parseFloat(formData.get('height')) || 0,
            weight: parseFloat(formData.get('weight')) || 0,
            shoeSize: parseFloat(formData.get('shoeSize')) || 0,
            experience: formData.get('experience') || '',
            ridingStyle: formData.get('ridingStyle') || '',
            terrain: formData.get('terrain') || '',
            stabilityPreference: parseInt(formData.get('stabilityPreference')) || 5
        };
    }

    hasMinimumData(data) {
        return data.height > 0 && data.weight > 0 && data.shoeSize > 0 && 
               data.experience && data.ridingStyle && data.terrain;
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }

    calculateRecommendations(data) {
        // Add updating animation
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => card.classList.add('updating'));

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

        return {
            width: Math.round(baseWidth * 10) / 10,
            length: Math.round(baseLength * 10) / 10,
            wheelbase: Math.round(wheelbase * 10) / 10
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

        return {
            width: truckWidth,
            height: truckHeight,
            tightness: tightness
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
        if (data.experience === 'advanced') {
            bearingRating = 'ABEC 7';
        }

        // Hardware length calculation
        // Physics: must account for deck thickness + truck baseplate + riser (if any)
        let hardwareLength = '1"'; // Standard

        if (data.ridingStyle === 'cruising' || data.ridingStyle === 'longboard') {
            hardwareLength = '1.25"'; // Longer for potential risers
        }

        return {
            bearingRating: bearingRating,
            hardwareLength: hardwareLength
        };
    }

    updateDeckResults(specs, data) {
        document.getElementById('deck-width').textContent = `${specs.width}"`;
        document.getElementById('deck-length').textContent = `${specs.length}"`;
        document.getElementById('wheelbase').textContent = `${specs.wheelbase}"`;

        const explanation = this.getDeckExplanation(specs, data);
        document.getElementById('deck-explanation').textContent = explanation;
    }

    updateTruckResults(specs, data) {
        document.getElementById('truck-width').textContent = `${specs.width}"`;
        document.getElementById('truck-height').textContent = specs.height;
        document.getElementById('truck-tightness').textContent = specs.tightness;

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

        const explanation = this.getHardwareExplanation(specs, data);
        document.getElementById('bearing-explanation').textContent = explanation;
    }

    getDeckExplanation(specs, data) {
        let explanation = `Width ${specs.width}" matches your shoe size for optimal foot placement. `;
        
        if (data.ridingStyle === 'street') {
            explanation += "Narrower deck chosen for easier flip tricks and technical maneuvers.";
        } else if (data.ridingStyle === 'cruising') {
            explanation += "Wider deck provides more stability and comfort for cruising.";
        } else {
            explanation += `Length ${specs.length}" provides good balance for your height and riding style.`;
        }

        return explanation;
    }

    getTruckExplanation(specs, data) {
        let explanation = `${specs.height} trucks chosen for your riding style. `;
        explanation += `${specs.tightness} tightness recommended based on your weight (${data.weight}kg) and stability preference.`;
        return explanation;
    }

    getWheelExplanation(specs, data) {
        let explanation = `${specs.diameter}mm wheels balance speed and maneuverability for ${data.ridingStyle}. `;
        explanation += `${specs.hardness} hardness provides optimal grip for ${data.terrain} terrain.`;
        return explanation;
    }

    getHardwareExplanation(specs, data) {
        return `${specs.bearingRating} bearings provide good performance for your riding style. ${specs.hardwareLength} hardware ensures proper assembly.`;
    }

    updatePhysicsExplanation(data, deckSpecs, truckSpecs, wheelSpecs) {
        const explanations = [];

        // Center of gravity explanation
        explanations.push(`<strong>Center of Gravity:</strong> Your ${deckSpecs.width}" deck width lowers your center of gravity relative to your shoe size, improving balance and control.`);

        // Moment of inertia explanation
        explanations.push(`<strong>Rotational Physics:</strong> The ${deckSpecs.wheelbase}" wheelbase creates optimal moment of inertia - longer for stability, shorter for quick turns.`);

        // Rolling resistance
        explanations.push(`<strong>Rolling Dynamics:</strong> ${wheelSpecs.diameter}mm wheels with ${wheelSpecs.hardness} hardness minimize rolling resistance while maximizing grip for your terrain.`);

        // Weight distribution
        if (data.weight > 80) {
            explanations.push(`<strong>Load Distribution:</strong> Your weight (${data.weight}kg) requires ${truckSpecs.tightness.toLowerCase()} trucks to maintain proper load distribution and prevent speed wobbles.`);
        }

        // Biomechanics
        explanations.push(`<strong>Biomechanics:</strong> Setup optimized for your height (${data.height}cm) ensures natural stance width and efficient power transfer.`);

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
