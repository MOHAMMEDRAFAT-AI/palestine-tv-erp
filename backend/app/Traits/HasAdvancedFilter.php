<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasAdvancedFilter
{
    public function scopeFilter(Builder $query, array $filters = []): Builder
    {
        $filterable = property_exists($this, 'filterable') ? $this->filterable : [];

        foreach ($filters as $key => $value) {
            if (in_array($key, $filterable) && $value !== null && $value !== '') {
                if (is_string($value)) {
                    $query->where($key, 'like', "%{$value}%");
                } else {
                    $query->where($key, $value);
                }
            }
        }

        return $query;
    }

    public function scopeSort(Builder $query, ?string $sortBy = null, ?string $sortDir = 'asc'): Builder
    {
        $sortable = property_exists($this, 'sortable') ? $this->sortable : [];

        if ($sortBy && in_array($sortBy, $sortable)) {
            $direction = in_array(strtolower($sortDir ?? 'asc'), ['asc', 'desc']) ? $sortDir : 'asc';
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    public function scopePaginate(Builder $query, int $perPage = 15)
    {
        $perPage = min(max($perPage, 1), 100);
        return $query->paginate($perPage);
    }
}
