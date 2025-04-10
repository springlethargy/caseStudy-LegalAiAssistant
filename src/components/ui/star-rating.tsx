"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    onChange?: (value: number) => void;
    maxRating?: number;
    count?: number;
}

export function StarRating({
    value = 0,
    onChange,
    maxRating = 10,
    count = 5,
    className,
    ...props
}: StarRatingProps) {
    const starsArray = Array.from({ length: count }, (_, i) => i + 1);
    const valuePerStar = maxRating / count;
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const handleClick = (starIndex: number, halfStar: boolean) => {
        if (!onChange) return;

        // Calculate the new rating value
        let newValue = starIndex * valuePerStar;
        if (halfStar) {
            newValue -= valuePerStar / 2;
        }

        onChange(newValue);
    };

    const handleMouseEnter = (starIndex: number, halfStar: boolean) => {
        let previewValue = starIndex * valuePerStar;
        if (halfStar) {
            previewValue -= valuePerStar / 2;
        }
        setHoverValue(previewValue);
    };

    const handleMouseLeave = () => {
        setHoverValue(null);
    };

    // Use hover value for preview if available, otherwise use actual value
    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
        <div
            className={cn("flex items-center space-x-1", className)}
            {...props}
            onMouseLeave={handleMouseLeave}
        >
            {starsArray.map((starIndex) => {
                const fillLevel = displayValue / valuePerStar - starIndex + 1;

                return (
                    <div
                        key={starIndex}
                        className="relative cursor-pointer group"
                        onClick={() => handleClick(starIndex, false)}
                        onMouseEnter={() => handleMouseEnter(starIndex, false)}
                    >
                        {/* Left half (for half-star ratings) */}
                        <div
                            className="absolute inset-0 w-1/2 z-10"
                            onClick={(e) => { e.stopPropagation(); handleClick(starIndex, true); }}
                            onMouseEnter={(e) => { e.stopPropagation(); handleMouseEnter(starIndex, true); }}
                        />

                        {fillLevel >= 1 ? (
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 transition-all duration-100" />
                        ) : fillLevel > 0 ? (
                            <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400 transition-all duration-100" />
                        ) : (
                            <Star className="h-5 w-5 text-muted-foreground group-hover:text-yellow-200 transition-all duration-100" />
                        )}

                        {/* Show hover state indicators */}
                        {hoverValue !== null && (
                            <div className="absolute inset-0 pointer-events-none">
                                {starIndex <= Math.ceil(hoverValue / valuePerStar) && (
                                    <div className={cn(
                                        "absolute inset-0 transition-opacity duration-75",
                                        fillLevel < 1 && fillLevel > 0 ? "opacity-100" : "opacity-0"
                                    )}>
                                        <div className="absolute inset-0 rounded-full bg-yellow-100/10" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            <span className="ml-2 text-sm text-muted-foreground">
                {displayValue.toFixed(1)}/{maxRating}
            </span>
        </div>
    );
} 