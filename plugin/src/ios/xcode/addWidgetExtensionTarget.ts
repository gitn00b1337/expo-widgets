import { XcodeProject } from "@expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types"
import * as util from "util"
import { Logging } from "../../utils/logger"
import { getProductTypeForTargetType } from "./productType";
import { getDefaultBuildConfigurationSettings } from "./buildConfiguration";

export const addWidgetExtensionTarget = (project: XcodeProject, config: ExpoConfig, options: WithExpoIOSWidgetsProps, name: string, bundleId?: string) => {
    const targetType = 'app_extension'
    const groupName = 'Embed Foundation Extensions'

    // Setup uuid and name of new target
    var targetUuid = project.generateUuid(),
        targetName = name.trim(),
        targetBundleId = bundleId;

    // Check type against list of allowed target types
    if (!targetName) {
        throw new Error("Target name missing.");
    }

    // Check type against list of allowed target types
    if (!targetType) {
        throw new Error("Target type missing.");
    }

    // Check type against list of allowed target types
    if (!getProductTypeForTargetType(targetType)) {
        throw new Error("Target type invalid: " + targetType);
    }

    const settings = getDefaultBuildConfigurationSettings(options, config);

    // Build Configuration: Create
    var buildConfigurationsList = [
        {
            name: 'Debug',
            isa: 'XCBuildConfiguration',
            buildSettings: {
                GCC_PREPROCESSOR_DEFINITIONS: ['"DEBUG=1"', '"$(inherited)"'],
                ...settings
            }
        },
        {
            name: 'Release',
            isa: 'XCBuildConfiguration',
            buildSettings: {
                ...settings
            }
        }
    ];

    // Add optional bundleId to build configuration
    if (targetBundleId) {
        buildConfigurationsList = buildConfigurationsList.map((elem) => {
            elem.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = '"' + targetBundleId + '"';
            return elem;
        });
    }

    // Build Configuration: Add
    var buildConfigurations = project.addXCConfigurationList(buildConfigurationsList, 'Release', 'Build configuration list for PBXNativeTarget "' + targetName +'"');

    // Product: Create
    var productName = targetName,
        productType = getProductTypeForTargetType(targetType),
        productFileType = fileTypeForProductType(productType);
        
    Logging.logger.debug(`Adding product file`)

    const productFile = project.addProductFile(productName, { 
        basename: `${targetName}.appex`,
        group: groupName, 
        target: targetUuid, 
        explicitFileType: productFileType,
        settings: {
            ATTRIBUTES: ["RemoveHeadersOnCopy"],
        },
        includeInIndex: 0,
        path: `${targetName}.appex`,
        sourceTree: 'BUILT_PRODUCTS_DIR',
    })

    // Product: Add to build file list
    project.addToPbxBuildFileSection(productFile);

    // Target: Create
    var target = {
            uuid: targetUuid,
            pbxNativeTarget: {
                isa: 'PBXNativeTarget',
                name: targetName,
                productName: '"' + targetName + '"',
                productReference: productFile.fileRef,
                productType: '"' + getProductTypeForTargetType(targetType) + '"',
                buildConfigurationList: buildConfigurations.uuid,
                buildPhases: [],
                buildRules: [],
                dependencies: []
            }
    };

    // Target: Add to PBXNativeTarget section
    project.addToPbxNativeTargetSection(target)

    project.addTargetAttribute('DevelopmentTeam', options.devTeamId, target)
    project.addTargetAttribute('DevelopmentTeam', options.devTeamId)

    // This has 'Copy Files' hardcoded. instead adjust to groupName
    //project.addToPbxCopyfilesBuildPhase(productFile)
    Logging.logger.debug(`Adding PBXCopyFilesBuildPhase`)
    project.addBuildPhase([], 'PBXCopyFilesBuildPhase', groupName, project.getFirstTarget().uuid,  targetType, '')

    Logging.logger.debug(`Fixing PBXCopyFilesBuildPhase`)
    project.buildPhaseObject('PBXCopyFilesBuildPhase', groupName, targetUuid)
        .files
        .push({
            value: productFile.uuid,
            comment: util.format("%s in %s", productFile.basename, productFile.group),
        })

    // Target: Add uuid to root project
    Logging.logger.debug(`Adding target to project section`)
    project.addToPbxProjectSection(target);

    // Return target on success
    return target;

};



const fileTypeForProductType = (productType: string) => {

    const FILETYPE_BY_PRODUCTTYPE: { [key: string]: string } = {
            'com.apple.product-type.application': '"wrapper.application"',
            'com.apple.product-type.app-extension': '"wrapper.app-extension"',
            'com.apple.product-type.bundle': '"wrapper.plug-in"',
            'com.apple.product-type.tool': '"compiled.mach-o.dylib"',
            'com.apple.product-type.library.dynamic': '"compiled.mach-o.dylib"',
            'com.apple.product-type.framework': '"wrapper.framework"',
            'com.apple.product-type.library.static': '"archive.ar"',
            'com.apple.product-type.bundle.unit-test': '"wrapper.cfbundle"',
            'com.apple.product-type.application.watchapp': '"wrapper.application"',
            'com.apple.product-type.application.watchapp2': '"wrapper.application"',
            'com.apple.product-type.watchkit-extension': '"wrapper.app-extension"',
            'com.apple.product-type.watchkit2-extension': '"wrapper.app-extension"'
        };

    return FILETYPE_BY_PRODUCTTYPE[productType]
}
