export const normalizeFeatures = (features: unknown): string[] => {
    if (typeof features === 'string') {
        const trimmedFeatures = features.trim()

        if (!trimmedFeatures) {
            return []
        }

        if (
            (trimmedFeatures.startsWith('{') && trimmedFeatures.endsWith('}')) ||
            (trimmedFeatures.startsWith('[') && trimmedFeatures.endsWith(']'))
        ) {
            try {
                return normalizeFeatures(JSON.parse(trimmedFeatures))
            } catch {
                return [trimmedFeatures]
            }
        }

        return [trimmedFeatures]
    }

    if (Array.isArray(features)) {
        return features
            .map((feature) => (typeof feature === 'string' ? feature.trim() : ''))
            .filter(Boolean)
    }

    if (features && typeof features === 'object') {
        return Object.entries(features as Record<string, unknown>)
            .sort(([leftKey], [rightKey]) => {
                const leftIndex = Number(leftKey)
                const rightIndex = Number(rightKey)

                if (Number.isNaN(leftIndex) || Number.isNaN(rightIndex)) {
                    return leftKey.localeCompare(rightKey)
                }

                return leftIndex - rightIndex
            })
            .map(([, value]) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
    }

    return []
}
