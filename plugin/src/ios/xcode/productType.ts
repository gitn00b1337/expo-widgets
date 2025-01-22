const PRODUCTTYPE_BY_TARGETTYPE: { [key: string]: string } = {
    application: 'com.apple.product-type.application',
    app_extension: 'com.apple.product-type.app-extension',
    bundle: 'com.apple.product-type.bundle',
    command_line_tool: 'com.apple.product-type.tool',
    dynamic_library: 'com.apple.product-type.library.dynamic',
    framework: 'com.apple.product-type.framework',
    static_library: 'com.apple.product-type.library.static',
    unit_test_bundle: 'com.apple.product-type.bundle.unit-test',
    watch_app: 'com.apple.product-type.application.watchapp',
    watch2_app: 'com.apple.product-type.application.watchapp2',
    watch_extension: 'com.apple.product-type.watchkit-extension',
    watch2_extension: 'com.apple.product-type.watchkit2-extension'
};

export const getProductTypeForTargetType = (targetType: string) => {
    return PRODUCTTYPE_BY_TARGETTYPE[targetType]
}