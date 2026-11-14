import { extend } from "@colordx/core";
import a11y from "@colordx/core/plugins/a11y";
import a98rgb from "@colordx/core/plugins/a98rgb";
import cmyk from "@colordx/core/plugins/cmyk";
import harmonies from "@colordx/core/plugins/harmonies";
import hsv from "@colordx/core/plugins/hsv";
import hwb from "@colordx/core/plugins/hwb";
import lab from "@colordx/core/plugins/lab";
import lch from "@colordx/core/plugins/lch";
import names from "@colordx/core/plugins/names";
import okhsl from "@colordx/core/plugins/okhsl";
import okhsv from "@colordx/core/plugins/okhsv";
import p3 from "@colordx/core/plugins/p3";
import prophoto from "@colordx/core/plugins/prophoto";
import rec2020 from "@colordx/core/plugins/rec2020";
import srgbLinear from "@colordx/core/plugins/srgb-linear";

// colordx keeps plugins in one global registry and `extend` does not de-duplicate, so
// register every plugin once here instead of in each module that parses colors.
extend([a11y, a98rgb, cmyk, harmonies, hsv, hwb, lab, lch, names, okhsl, okhsv, p3, prophoto, rec2020, srgbLinear]);
