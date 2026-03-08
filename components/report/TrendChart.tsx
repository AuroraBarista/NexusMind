"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function TrendChart() {
    // Mock Data for "Knowledge Velocity" (Last 7 Days)
    const data = [12, 18, 9, 24, 32, 18, 45];
    const max = Math.max(...data);

    return (
        <div className="flex items-end gap-1 h-8 w-full">
            {data.map((val, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex-1 bg-black/80 hover:bg-cyan-500 transition-colors rounded-sm cursor-pointer"
                    title={`${val} snippets`}
                />
            ))}
        </div>
    );
}
