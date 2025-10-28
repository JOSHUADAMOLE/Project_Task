<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Label\StoreLabelRequest;
use App\Http\Requests\Label\UpdateLabelRequest;
use App\Http\Resources\Label\LabelResource;
use App\Models\Label;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabelController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Label::class, 'label');
    }

    public function index(Request $request): Response
    {
        // ✅ Ensure only 3 fixed labels exist
        $this->resetToDefaultLabels();

        return Inertia::render('Settings/Labels/Index', [
            'items' => LabelResource::collection(
                Label::query()
                    ->orderBy('id')
                    ->paginate(12)
            ),
        ]);
    }

    public function create()
    {
        return redirect()->route('settings.labels.index')
            ->warning('Action not allowed', 'You cannot create new labels. Only the 3 default ones are available.');
    }

    public function store(StoreLabelRequest $request)
    {
        return redirect()->route('settings.labels.index')
            ->warning('Action not allowed', 'You cannot add new labels. Only the default ones are allowed.');
    }

    public function edit(Label $label)
    {
        return Inertia::render('Settings/Labels/Edit', [
            'item' => new LabelResource($label),
        ]);
    }

    public function update(Label $label, UpdateLabelRequest $request)
    {
        // Allow updating color only
        $data = $request->validated();
        unset($data['name']);

        $label->update($data);

        return redirect()->route('settings.labels.index')
            ->success('Label updated', 'Label color updated successfully.');
    }

    public function destroy(Label $label)
    {
        return redirect()->back()
            ->warning('Action not allowed', 'You cannot delete the default labels.');
    }

    public function restore(int $labelId)
    {
        $label = Label::withArchived()->findOrFail($labelId);
        $this->authorize('restore', $label);
        $label->unArchive();

        return redirect()->back()->success('Label restored', 'The label was restored successfully.');
    }

    /**
     * Remove all non-default labels and ensure only 3 fixed ones exist.
     */
    protected function resetToDefaultLabels()
    {
        $defaultNames = ['Completed', 'Incomplete', 'In Progress'];

        // ❌ Delete everything except the 3 defaults
        Label::whereNotIn('name', $defaultNames)->delete();

        // ✅ Recreate missing defaults if they don't exist
        $defaults = [
            ['name' => 'Completed', 'color' => '#309E44'],
            ['name' => 'Incomplete', 'color' => '#E03231'],
            ['name' => 'In Progress', 'color' => '#F08C00'],
        ];

        foreach ($defaults as $default) {
            Label::firstOrCreate(['name' => $default['name']], $default);
        }
    }
}
