<?php

namespace OrcaForge\Laravel\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

trait Filterable
{
    public function scopeFilter(Builder $query, array $filters = []): Builder
    {
        foreach ($filters as $field => $value) {
            // Skip empty values, but allow '0' or false which are valid DB values
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

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Add the trait to your Eloquent Model and define the filter methods:
| class User extends Authenticatable
| {
|     use \OrcaForge\Laravel\Traits\Filterable;
|
|     // Maps to ?search=xyz
|     public function filterSearch($query, $value)
|     {
|         $query->where('name', 'like', "%{$value}%")
|               ->orWhere('email', 'like', "%{$value}%");
|     }
|
|     // Maps to ?role=admin
|     public function filterRole($query, $value)
|     {
|         $query->where('role', $value);
|     }
| }
|
| // 2. Call it in your Controller with the Inertia request data:
| public function index()
| {
|     $users = User::query()
|         ->filter(request()->only(['search', 'role']))
|         ->paginate(10)
|         ->withQueryString();
|
|     return Inertia::render('Users/Index', [
|         'users' => $users,
|         'filters' => request()->only(['search', 'role']),
|     ]);
| }
|
*/