# 3D Beam Caustic Analysis (ISO 11146 Second-Moment Fit)

This document explains the mathematical foundations and standard ISO 11146 definitions behind the parameters extracted from the laser propagation calculator. All beam radii referenced in this document are **ISO 11146 second-moment beam radii**, unless stated otherwise.

## 1. Calculating Beam Radius at each Plane ($w_{avg}(z)$)
The calculator first propagates the complex electric field to multiple longitudinal planes ($z$). At each plane, the intensity profile $I(x,y) = |E(x,y)|^2$ is analysed using the **second-order spatial moments** (variance) to define the beam radius.

The center of mass $(\bar{x}, \bar{y})$ is found, followed by the variance (second spatial moment):
$$ \sigma_x^2 = \frac{\iint (x - \bar{x})^2 I(x,y)\, dx\, dy}{\iint I(x,y)\, dx\, dy} $$

The ISO 11146 beam radius is defined as **twice the standard deviation** (i.e. twice the square root of the second spatial moment) of the intensity distribution:
$$ w_x = 2\sqrt{\sigma_x^2} = 2\sigma_x, \qquad w_y = 2\sqrt{\sigma_y^2} = 2\sigma_y $$

For a perfect fundamental Gaussian beam $I(x) \propto \exp(-2x^2/w_G^2)$, the second-moment radius is identical to the conventional $1/e^2$ intensity radius $w_G$. For arbitrary (non-Gaussian) beam profiles, the second-moment radius characterises the spatial extent of the beam but is **not** necessarily equal to a physical $1/e^2$ contour.

The average beam radius $w_{avg}(z)$ used for the caustic fit is given by the root-mean-square average:
$$ w_{avg}(z) = \sqrt{\frac{w_x^2 + w_y^2}{2}} $$

## 2. Fitting the Caustic Hyperbola
According to diffraction theory, the squared ISO second-moment beam radius of any stigmatic paraxial laser beam expands quadratically along the propagation axis $z$:
$$ w^2(z) = w_0^2 + \left( M^2 \frac{\lambda}{\pi w_0} \right)^2 (z - z_0)^2 $$

This is algebraically equivalent to the form often found in textbooks:
$$ w(z) = \sqrt{ w_0^2 + \left( M^2 \frac{\lambda (z - z_0)}{\pi w_0} \right)^2 } $$

Expanding the squared form yields a general polynomial in $z$:
$$ w^2(z) = A \cdot z^2 + B \cdot z + C $$

The calculator performs a deterministic least-squares fit (using Cramer's rule) on the array of $w_{avg}^2(z)$ vs $z$ to extract the parameters $A, B$, and $C$.

## 3. Extracting the Parameters
Once $A, B$, and $C$ are found, the physical properties of the beam are calculated as follows:

### Focus Shift / Axial Waist Offset ($z_0 - f$)
The focal plane is the point where the beam radius is minimized. Taking the derivative of the parabola $A z^2 + B z + C$ and setting it to zero yields:
$$ z_0 = -\frac{B}{2A} $$

### Waist Radius ($w_0$)
The fitted waist radius corresponds to the **minimum ISO second-moment beam radius**. For a perfect Gaussian beam, this is identical to the conventional $1/e^2$ beam radius, while for arbitrary beam profiles it represents the ISO-defined second-moment radius.

Substituting $z_0$ back into the parabola:
$$ w_0 = \sqrt{C - \frac{B^2}{4A}} $$

### Beam Quality Factor ($M^2$)
Comparing the general polynomial to the theoretical $w^2(z)$ equation, the divergence term $A$ corresponds to $(M^2 \lambda / (\pi w_0))^2$. Solving for $M^2$:
$$ M^2 = \frac{\pi \cdot w_0 \sqrt{A}}{\lambda} $$

The beam quality factor $M^2$ is determined from the fitted beam caustic according to ISO 11146. It is obtained from both the measured waist size and beam divergence, making it independent of the location at which the beam is measured. By definition, $M^2 \ge 1$; a perfect fundamental Gaussian beam has $M^2 = 1$.

> **Relation to a diffraction-limited focus**
>
> For an ideal lens focusing a beam of the same input diameter, the diffraction-limited waist is
>
> $$ w_{\mathrm{DL}} = \frac{\lambda f}{\pi w_{\mathrm{in}}} $$
>
> If the actual focused beam has waist $w_{\mathrm{real}}$, then under ideal conditions
>
> $$ M^2 = \frac{w_{\mathrm{real}}}{w_{\mathrm{DL}}} $$
>
> This provides an intuitive interpretation of $M^2$, but it is **not** the ISO definition. ISO 11146 instead determines $M^2$ from a least-squares fit to the entire beam caustic using second-moment beam radii.

### Rayleigh Range ($z_R$)
The Rayleigh range is the distance from the waist at which the beam area doubles ($w(z_R) = \sqrt{2}\, w_0$):
$$ z_R = \frac{\pi w_0^2}{M^2 \lambda} = \frac{w_0}{\sqrt{A}} $$

### Waist FWHM Spot Diameter ($d_0$)
While $w_0$ represents the ISO second-moment beam radius, it is often useful to state the Full-Width at Half-Maximum (FWHM) diameter. For a Gaussian intensity profile, the conversion is:
$$ d_{FWHM} = 2 w_0 \sqrt{\frac{\ln 2}{2}} = w_0 \sqrt{2 \ln 2} \approx 1.1774 \cdot w_0 $$

Note: This conversion assumes a Gaussian intensity distribution. For non-Gaussian beams, the relationship between the second-moment radius and the physical FWHM may differ.

---
### Verification Example
Using the screenshot provided:
* **Waist Radius:** $w_0 = 59.4 \, \text{\mu m}$
* **$M^2$:** $5.24$
* **Wavelength (assumed default):** $\lambda = 800 \, \text{nm}$

Testing the **Rayleigh Range** formula:
$$ z_R = \frac{\pi \cdot (0.0594 \, \text{mm})^2}{5.24 \cdot 0.0008 \, \text{mm}} = 2.64 \, \text{mm} $$
*(Perfectly matches the $2.64 \, \text{mm}$ in the table)*

Testing the **FWHM** formula:
$$ d_0 = 59.4 \, \text{\mu m} \cdot \sqrt{2 \ln 2} = 69.93 \, \text{\mu m} $$
*(Perfectly matches the $69.9 \, \text{\mu m}$ in the table)*
