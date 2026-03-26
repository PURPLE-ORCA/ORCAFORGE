<?php

namespace OrcaForge\Laravel\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

trait Filterable
{
    /**
     * Automatically apply requested filters to the query builder.
     *
     * @param Builder $query
     * @param array $filters Usually request()->all() or request()->only([...])
     */
    public function scopeFilter(Builder $query, array $filters = []): Builder
    {
        foreach ($filters as $field => $value) {
            // Skip empty values (but allow '0' or false)
            if ($value === null || $value === '') {
                continue;
            }

            // Convert 'search_query' to 'filterSearchQuery'
            $method = 'filter' . Str::studly($field);

            // If the model has a specific method for this filter, call it
            if (method_exists($this, $method)) {
                $this->{$method}($query, $value);
            }
        }

        return $query;
    }
}